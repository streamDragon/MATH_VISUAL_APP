-- Apply as project owner in Supabase SQL Editor. No service-role key goes to a browser.
begin;
create table public.learning_moderators(user_id uuid primary key references auth.users(id) on delete cascade);
create table public.learning_profiles(user_id uuid primary key references auth.users(id) on delete cascade,nickname text not null check(char_length(nickname) between 1 and 24),avatar text not null default 'orbit' check(avatar in ('orbit','bot','fox')),grade integer not null check(grade between 9 and 11));
create table public.learning_entitlements(user_id uuid primary key references auth.users(id) on delete cascade,plan text not null check(plan in ('premium','class')),expires_at timestamptz,granted_at timestamptz not null default now());
create table public.learning_content(id text primary key,payload jsonb not null,tier text not null check(tier in ('free','premium')),published boolean not null default false,updated_at timestamptz not null default now());
create table public.learning_mastery(user_id uuid not null references auth.users(id) on delete cascade,activity_id text not null references public.learning_content(id),completed_at timestamptz not null default now(),primary key(user_id,activity_id));
create table public.learning_cohorts(id uuid primary key default gen_random_uuid(),mode text not null check(mode in ('solo','class')),grade integer not null check(grade between 9 and 11),band integer not null default 0,name text,owner_id uuid references auth.users(id),code text unique,activity_ids text[] not null check(cardinality(activity_ids)>0),created_at timestamptz not null default now());
create table public.learning_members(cohort_id uuid not null references public.learning_cohorts(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,joined_at timestamptz not null default now(),primary key(cohort_id,user_id));
create table public.learning_bonuses(cohort_id uuid not null references public.learning_cohorts(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,awarded_at timestamptz not null default now(),primary key(cohort_id));
create table public.learning_requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,client_request_id uuid not null,question_text text not null check(char_length(question_text)<=5000),grade integer not null check(grade between 9 and 11),language text not null check(language in ('he','en')),image_path text,source_url text,status text not null default 'pending' check(status in ('pending','reviewing','answered','rejected')),response_activity_id text references public.learning_content(id),response_note text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id,client_request_id));
create index learning_request_queue on public.learning_requests(status,created_at);
create index learning_cohort_match on public.learning_cohorts(mode,grade,band,created_at);

create function public.learning_is_moderator() returns boolean language sql stable security definer set search_path=public,pg_temp as $$select exists(select 1 from public.learning_moderators where user_id=auth.uid())$$;
create function public.learning_has_access() returns boolean language sql stable security definer set search_path=public,pg_temp as $$select public.learning_is_moderator() or exists(select 1 from public.learning_entitlements where user_id=auth.uid() and (expires_at is null or expires_at>now())) or exists(select 1 from public.learning_members m join public.learning_cohorts c on c.id=m.cohort_id join public.learning_entitlements e on e.user_id=c.owner_id where m.user_id=auth.uid() and c.mode='class' and e.plan='class' and (e.expires_at is null or e.expires_at>now()))$$;

do $$declare t text;begin foreach t in array array['learning_moderators','learning_profiles','learning_entitlements','learning_content','learning_mastery','learning_cohorts','learning_members','learning_bonuses','learning_requests'] loop execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from anon, authenticated',t);end loop;end$$;
grant select on public.learning_content to anon,authenticated;
grant select,insert,update on public.learning_profiles to authenticated;
grant select on public.learning_entitlements,public.learning_mastery,public.learning_requests to authenticated;
create policy profile_own_select on public.learning_profiles for select to authenticated using(user_id=auth.uid());
create policy profile_own_insert on public.learning_profiles for insert to authenticated with check(user_id=auth.uid());
create policy profile_own_update on public.learning_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy entitlement_own on public.learning_entitlements for select to authenticated using(user_id=auth.uid());
create policy content_access on public.learning_content for select using(published and (tier='free' or public.learning_has_access()));
create policy mastery_own on public.learning_mastery for select to authenticated using(user_id=auth.uid());
create policy request_own_or_moderator on public.learning_requests for select to authenticated using(user_id=auth.uid() or public.learning_is_moderator());

create function public.learning_catalog() returns setof jsonb language sql stable security definer set search_path=public,pg_temp as $$select jsonb_build_object('id',id,'title',payload->>'title','grade',(payload->>'grade')::int,'topic',payload->>'topic','topicLabel',payload->>'topicLabel','summary',payload->>'summary','tier',tier,'minutes',(payload->>'minutes')::int,'level',(payload->>'level')::int,'en',jsonb_build_object('title',payload->'en'->>'title','topicLabel',payload->'en'->>'topicLabel','summary',payload->'en'->>'summary')) from public.learning_content where published order by id$$;

create function public.learning_submit_request(question_text text,question_grade int,question_language text,image_path text default null,source_url text default null,client_request_id uuid default gen_random_uuid()) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid();rid uuid;quota int;existing uuid;
begin
 if uid is null then raise exception 'sign_in_required';end if;
 if char_length(trim(question_text))=0 and image_path is null then raise exception 'question_required';end if;
 if char_length(question_text)>5000 or question_grade not between 9 and 11 or question_language not in ('he','en') then raise exception 'invalid_question';end if;
 if image_path is not null and (split_part(image_path,'/',1)<>uid::text or not exists(select 1 from storage.objects where bucket_id='learning-requests' and name=image_path)) then raise exception 'invalid_image';end if;
 if source_url is not null and (char_length(source_url)>2000 or source_url !~ '^https?://') then raise exception 'invalid_source';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select r.id into existing from public.learning_requests r where r.user_id=uid and r.client_request_id=learning_submit_request.client_request_id;
 if existing is not null then return jsonb_build_object('id',existing);end if;
 quota:=case when public.learning_has_access() then 10 else 2 end;
 if (select count(*) from public.learning_requests where user_id=uid and created_at>=date_trunc('month',now()))>=quota then raise exception 'request_quota';end if;
 insert into public.learning_requests(user_id,client_request_id,question_text,grade,language,image_path,source_url) values(uid,client_request_id,trim(question_text),question_grade,question_language,image_path,nullif(source_url,'')) returning id into rid;
 return jsonb_build_object('id',rid,'status','pending');
end$$;

create function public.learning_submit_mastery(activity_id text,first_answer double precision,transfer_answer double precision) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid();a jsonb;access_tier text;cid uuid;won boolean:=false;tol double precision;
begin
 if uid is null then raise exception 'sign_in_required';end if;
 select payload,tier into a,access_tier from public.learning_content where id=activity_id and published;
 if a is null or (access_tier='premium' and not public.learning_has_access()) then raise exception 'activity_access';end if;
 if first_answer is null or transfer_answer is null or first_answer::text in ('NaN','Infinity','-Infinity') or transfer_answer::text in ('NaN','Infinity','-Infinity') then raise exception 'invalid_answer';end if;
 tol:=coalesce((a->>'tolerance')::double precision,0.05);
 if abs(first_answer-(a->>'answer')::double precision)>tol or abs(transfer_answer-(a->'transfer'->>'answer')::double precision)>tol then raise exception 'wrong_answer';end if;
 insert into public.learning_mastery(user_id,activity_id) values(uid,activity_id) on conflict do nothing;
 for cid in select c.id from public.learning_cohorts c join public.learning_members m on m.cohort_id=c.id where m.user_id=uid and c.activity_ids<@array(select mm.activity_id from public.learning_mastery mm where mm.user_id=uid) loop
  insert into public.learning_bonuses(cohort_id,user_id) values(cid,uid) on conflict do nothing;
  if found then won:=true;end if;
 end loop;
 return jsonb_build_object('mastered',true,'summit_bonus',won,'xp',(select count(*)*40 from public.learning_mastery where user_id=uid)+(select count(*)*20 from public.learning_bonuses where user_id=uid));
end$$;

create function public.learning_progress() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception 'sign_in_required';end if;
 return jsonb_build_object('mastered',to_jsonb(array(select activity_id from public.learning_mastery where user_id=auth.uid() order by activity_id)),'xp',(select count(*)*40 from public.learning_mastery where user_id=auth.uid())+(select count(*)*20 from public.learning_bonuses where user_id=auth.uid()));
end$$;
revoke all on function public.learning_progress() from public,anon;
grant execute on function public.learning_progress() to authenticated;

create function public.learning_join_cohort(cohort_mode text,learner_grade int,class_code text default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid();cid uuid;b int;ids text[];
begin
 if uid is null then raise exception 'sign_in_required';end if;
 if learner_grade not between 9 and 11 or not exists(select 1 from public.learning_profiles where user_id=uid) then raise exception 'profile_required';end if;
 if cohort_mode='class' then
  select id into cid from public.learning_cohorts where code=upper(class_code) and mode='class';if cid is null then raise exception 'invalid_class';end if;
 else
  if cohort_mode<>'solo' then raise exception 'invalid_mode';end if;
  b:=(select count(*)/4 from public.learning_mastery where user_id=uid);
  perform pg_advisory_xact_lock(learner_grade,b);
  select c.id into cid from public.learning_cohorts c join public.learning_members m on m.cohort_id=c.id where m.user_id=uid and c.mode='solo' and c.grade=learner_grade and c.created_at>now()-interval '7 days' order by c.created_at desc limit 1;
  if cid is null then select c.id into cid from public.learning_cohorts c where c.mode='solo' and c.grade=learner_grade and c.band=b and c.created_at>now()-interval '7 days' and (select count(*) from public.learning_members where cohort_id=c.id)<11 order by c.created_at limit 1;end if;
  if cid is null then
   select array_agg(id) into ids from(select id from public.learning_content where published and tier='free' and (payload->>'grade')::int=learner_grade order by id limit 5)s;
   if ids is null then raise exception 'no_activities';end if;
   insert into public.learning_cohorts(mode,grade,band,activity_ids) values('solo',learner_grade,b,ids) returning id into cid;
  end if;
 end if;
 insert into public.learning_members(cohort_id,user_id) values(cid,uid) on conflict do nothing;
 return jsonb_build_object('id',cid,'mode',cohort_mode);
end$$;

create function public.learning_race_board(cohort_id uuid) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare ids text[];peers jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.learning_members m where m.cohort_id=learning_race_board.cohort_id and m.user_id=auth.uid()) then raise exception 'cohort_access';end if;
 select activity_ids into ids from public.learning_cohorts where id=cohort_id;
 select coalesce(jsonb_agg(row_to_json(p)),'[]'::jsonb) into peers from(select pr.nickname,pr.avatar,m.user_id=auth.uid() as is_self,(select count(*) from public.learning_mastery mm where mm.user_id=m.user_id and mm.activity_id=any(ids)) as completed from public.learning_members m join public.learning_profiles pr on pr.user_id=m.user_id where m.cohort_id=learning_race_board.cohort_id order by completed desc,(select max(mm.completed_at) from public.learning_mastery mm where mm.user_id=m.user_id and mm.activity_id=any(ids)) asc nulls last,m.joined_at limit 100)p;
 return jsonb_build_object('goal',cardinality(ids),'peers',peers,'activity_ids',to_jsonb(ids),'completed_ids',to_jsonb(array(select activity_id from public.learning_mastery where user_id=auth.uid() and activity_id=any(ids) order by activity_id)));
end$$;

create function public.learning_create_class(class_name text,learner_grade int,activity_ids text[]) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare cid uuid;invite text;
begin
 if auth.uid() is null then raise exception 'sign_in_required';end if;
 if not public.learning_is_moderator() and not exists(select 1 from public.learning_entitlements where user_id=auth.uid() and plan='class' and(expires_at is null or expires_at>now())) then raise exception 'class_access';end if;
 if char_length(trim(class_name)) not between 1 and 60 or learner_grade not between 9 and 11 or cardinality(activity_ids) not between 1 and 20 then raise exception 'invalid_class';end if;
 if exists(select 1 from unnest(activity_ids) q(id) where not exists(select 1 from public.learning_content c where c.id=q.id and c.published)) then raise exception 'invalid_activities';end if;
 invite:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
 insert into public.learning_cohorts(mode,grade,name,owner_id,code,activity_ids) values('class',learner_grade,trim(class_name),auth.uid(),invite,activity_ids) returning id into cid;
 insert into public.learning_members(cohort_id,user_id) values(cid,auth.uid());
 return jsonb_build_object('id',cid,'code',invite);
end$$;

create function public.learning_review_request(request_id uuid,next_status text,response_activity text default null,response_note text default '') returns void language plpgsql security definer set search_path=public,pg_temp as $$begin
 if not public.learning_is_moderator() then raise exception 'moderator_required';end if;
 if next_status not in ('pending','reviewing','answered','rejected') or char_length(response_note)>3000 then raise exception 'invalid_status';end if;
 if next_status='answered' and (response_activity is null or not exists(select 1 from public.learning_content where id=response_activity and published and tier='free')) then raise exception 'free_response_activity_required';end if;
 update public.learning_requests set status=next_status,response_activity_id=response_activity,response_note=learning_review_request.response_note,updated_at=now() where id=request_id;
end$$;

create function public.learning_publish_activity(activity jsonb) returns void language plpgsql security definer set search_path=public,pg_temp as $$begin
 if not public.learning_is_moderator() then raise exception 'moderator_required';end if;
 if activity->>'id' !~ '^[a-z0-9][a-z0-9-]{2,80}$' or activity->>'tier' not in ('free','premium') or activity->>'kind' not in ('linear','quadratic','intersection','triangle','probability','derivative') or (activity->>'grade')::int not between 9 and 11 or jsonb_typeof(activity->'params')<>'object' or jsonb_typeof(activity->'transfer')<>'object' or jsonb_typeof(activity->'en')<>'object' or not(activity ? 'answer') then raise exception 'invalid_activity';end if;
 insert into public.learning_content(id,payload,tier,published) values(activity->>'id',activity,activity->>'tier',true) on conflict(id) do update set payload=excluded.payload,tier=excluded.tier,published=true,updated_at=now();
end$$;

-- Function grants are explicit: no browser can write plans, scores or moderator roles.
revoke all on function public.learning_is_moderator(),public.learning_has_access(),public.learning_catalog() from public;
grant execute on function public.learning_is_moderator(),public.learning_has_access() to anon,authenticated;
grant execute on function public.learning_catalog() to anon,authenticated;
revoke all on function public.learning_submit_request(text,int,text,text,text,uuid),public.learning_submit_mastery(text,double precision,double precision),public.learning_join_cohort(text,int,text),public.learning_race_board(uuid),public.learning_create_class(text,int,text[]),public.learning_review_request(uuid,text,text,text),public.learning_publish_activity(jsonb) from public,anon;
grant execute on function public.learning_submit_request(text,int,text,text,text,uuid),public.learning_submit_mastery(text,double precision,double precision),public.learning_join_cohort(text,int,text),public.learning_race_board(uuid),public.learning_create_class(text,int,text[]),public.learning_review_request(uuid,text,text,text),public.learning_publish_activity(jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('learning-requests','learning-requests',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy learning_image_upload on storage.objects for insert to authenticated with check(bucket_id='learning-requests' and (storage.foldername(name))[1]=auth.uid()::text);
create policy learning_image_read on storage.objects for select to authenticated using(bucket_id='learning-requests' and ((storage.foldername(name))[1]=auth.uid()::text or public.learning_is_moderator()));
commit;
