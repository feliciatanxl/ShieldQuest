const fs=require('node:fs');
// Windows scanners/importers can briefly hold exported assets open. Skip identical data and retry bounded writes.
function writeExport(file,data){
 const buffer=Buffer.isBuffer(data)?data:Buffer.from(data);
 try{if(fs.existsSync(file)&&fs.readFileSync(file).equals(buffer))return;}catch{}
 for(let attempt=0;;attempt++){
  try{fs.writeFileSync(file,buffer);return;}catch(error){
   if(attempt>=8||!['UNKNOWN','EBUSY','EPERM','EACCES'].includes(error.code))throw error;
   Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,125);
  }
 }
}
module.exports={writeExport};
