const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const load=require('node:module').createRequire(path.resolve('infra/multiplayer/package.json'));
load('tsx/cjs');
const payload=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const readers={S:['spotTheRisk','readSpotResult'],H:['holdBeforeActing','readHoldResult'],I:['identifyTheInfluence','readInfluenceResult'],E:['evaluateConsequences','readConsequencesResult'],L:['leadTheRightChoice','readLeadResult'],D:['defendYourCommunity','readDefendResult']};
for(const result of payload.assessments){
 const [file,name]=readers[result.competency];const canonical=require(path.resolve(`src/state/${file}.ts`))[name](result);
 assert.ok(canonical,`Phaser rejected ${result.competency}`);assert.deepEqual(result,canonical,`${result.competency} differs from Phaser grading`);
}
global.localStorage={getItem:key=>key==='shieldquest.phase1'?JSON.stringify(payload.save):null};
const restored=require(path.resolve('src/state/saveGame.ts')).readSave();assert.ok(restored,'Phaser rejected native save');
assert.deepEqual(restored.shield,payload.save.shield,'assessment results lost on import');
assert.deepEqual(restored.escapeRoom,payload.save.escapeRoom,'house progress changed on import');
console.log('Phaser accepted all 6 native assessment results and the completed house save.');
