// Images now go to the private human request queue; there is no runtime AI scan.
export default function handler(req,res){res.setHeader('Cache-Control','no-store');return res.status(410).json({error:'ai_runtime_retired',message:'Attach the image to a human review request in the learning app.'});}
