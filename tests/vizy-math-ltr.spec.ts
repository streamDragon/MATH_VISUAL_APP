import {test,expect} from '@playwright/test';

const open=async(page,lesson:string,key:string)=>{
 await page.goto('/problem-map.html?lesson='+lesson);
 await page.evaluate(k=>localStorage.removeItem(k),key);
 await page.reload();
};
// Left edge of each character of a text node, in the order given.
const lefts=async(locator,chars:string[])=>locator.evaluate((el,cs)=>{
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
 let node:Text|null=null;while(walker.nextNode()){const n=walker.currentNode as Text;if(n.data.trim()){node=n;break;}}
 const t=node!.data;
 return cs.map(c=>{const i=t.indexOf(c);const r=document.createRange();r.setStart(node!,i);r.setEnd(node!,i+1);return r.getBoundingClientRect().left;});
},chars);

test('the answer (A−B)² reads left to right in the first decision',async({page})=>{
 await open(page,'difference-squares','vizy_inquiry_v1_map');
 const option=page.locator('#iqEntryOverlay [data-iq-answer="square"]');
 await expect(option).toHaveText('(A−B)²');
 await expect(option).toHaveAttribute('dir','ltr');
 const [open_,close,power]=await lefts(option,['(',')','²']);
 expect(open_).toBeLessThan(close);
 expect(close).toBeLessThan(power);
});

test('the big expression has no gaps around its brackets',async({page})=>{
 await open(page,'difference-squares','vizy_inquiry_v1_map');
 const expr=page.locator('#iqEntryOverlay .iq-entry-expression');
 await expect(expr).toHaveText('(x+1)² − 9');
 const gap=await expr.evaluate(el=>{
  const node=el.firstChild as Text,t=node.data;
  const box=(i:number)=>{const r=document.createRange();r.setStart(node,i);r.setEnd(node,i+1);return r.getBoundingClientRect();};
  const paren=box(t.indexOf('(')),x=box(t.indexOf('x'));
  return (x.left-paren.right)/parseFloat(getComputedStyle(el).fontSize);
 });
 // Ink to ink is checked by eye in screenshots; here the boxes must not leave a wide gap.
 expect(gap).toBeLessThan(0.12);
});

test('the pinned given keeps its formula left to right',async({page})=>{
 await open(page,'difference-squares','vizy_inquiry_v1_map');
 await page.locator('#iqEntryOverlay [data-iq-answer="diff"]').click();
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
 const strip=page.locator('#iqGivenStrip');
 await expect(strip).toHaveText('המקרה שלנו: (x+1)² − 9');
 const formula=strip.locator('span.vizy-math');
 await expect(formula).toHaveText('(x+1)² − 9');
 const [paren,power,nine]=await lefts(formula,['(','²','9']);
 expect(paren).toBeLessThan(power);
 expect(power).toBeLessThan(nine);
});

test('Hebrew answers are not forced left to right',async({page})=>{
 await open(page,'increasing','vizy_inquiry_v1_graph');
 const option=page.locator('#iqEntryOverlay [data-iq-answer="A"]');
 await expect(option).toBeVisible();
 expect(await option.getAttribute('dir')).toBeNull();
});
