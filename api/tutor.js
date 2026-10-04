// Retired endpoint. Old clients cannot invoke a provider even if credentials remain configured.
export default function handler(req,res){res.setHeader('Cache-Control','no-store');return res.status(410).json({error:'ai_runtime_retired',message:'Use the prepared learning bank or submit a request for human review.'});}
