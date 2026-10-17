const fs=require('node:fs');const assert=require('node:assert/strict');const esbuild=require('esbuild');const Module=require('node:module');const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const build=await esbuild.build({stdin:{contents:"export * from './lib/booking-model';export * from './lib/booking-service';",resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,platform:'node',format:'cjs',write:false});
 const generated=new Module(__filename,module);generated.filename=__filename;generated.paths=Module._nodeModulePaths(root);generated._compile(build.outputFiles[0].text,__filename);const M=generated.exports;
 const now=new Date('2026-10-17T00:00:00Z'); // 土曜日、日本時間09:00
 assert.deepEqual(M.jstNow(new Date('2026-10-16T15:30:00Z')),{date:'2026-10-17',minute:30});
 assert.equal(M.validDate('2026-02-30'),false);assert.equal(M.validDate('2028-02-29'),true);
 assert(M.dateReason('2026-10-16',now));assert(M.dateReason('2026-10-21',now));assert.equal(M.dateReason('2026-10-17',now),'');assert(M.dateReason(M.addDays('2026-10-17',61),now));
 assert.equal(M.slotReason({date:'2026-10-17',time:1140,menuId:'standard'},[],undefined,now),'');assert(M.slotReason({date:'2026-10-17',time:1170,menuId:'standard'},[],undefined,now));
 assert.equal(M.slotReason({date:'2026-10-17',time:1170,menuId:'short'},[],undefined,now),'');assert(M.slotReason({date:'2026-10-17',time:1140,menuId:'long'},[],undefined,now));
 assert(M.slotReason({date:'2026-10-17',time:720,menuId:'standard'},[],undefined,now));assert.equal(M.slotReason({date:'2026-10-17',time:690,menuId:'standard'},[],undefined,now),'');
 assert(M.slotReason({date:'2026-10-17',time:615,menuId:'short'},[],undefined,now));assert(M.slotReason({date:'2026-10-17',time:600,menuId:'short'},[],undefined,new Date('2026-10-17T01:00:00Z')));
 const service=M.createDemoReservationService(()=>now),selection={menuId:'standard',date:'2026-10-17',time:600};
 const results=await Promise.allSettled([service.create({...selection,name:'NOT_STORED',email:'not@stored.test'}),service.create(selection)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);
 const record=results.find(r=>r.status==='fulfilled').value;assert(!JSON.stringify(service.list()).includes('NOT_STORED'));assert(!JSON.stringify(service.list()).includes('not@stored'));
 assert(M.slotReason({...selection,time:630},service.list(),undefined,now));assert.equal(M.slotReason({...selection,time:660},service.list(),undefined,now),'');
 await assert.rejects(()=>service.change(record.id,{...selection,time:750}));assert.equal(service.list()[0].time,600);
 await service.change(record.id,{...selection,time:660});assert.equal(M.slotReason(selection,service.list(),undefined,now),'');
 await service.cancel(record.id);assert.equal(M.slotReason({...selection,time:660},service.list(),undefined,now),'');await assert.rejects(()=>service.change(record.id,selection));
 assert(Object.keys(M.personErrors(M.emptyPerson())).length>=3);assert.deepEqual(M.personErrors({name:'デモ',email:'demo@example.com',phone:'',request:'',consent:true}),{});
 assert(M.personErrors({name:'デモ',email:'bad',phone:'1',request:'a'.repeat(301),consent:false}).email);
 assert.equal(M.monthDays('2028-02').filter(Boolean).length,29);assert.equal(M.shiftMonth('2026-12',1),'2027-01');
 console.log('PASS: JST/date/holiday/horizon, durations/closing/sample busy boundaries, simultaneous duplicate creation, atomic failed change, change/cancel releases slots, no customer data in records, validation and month boundaries.');
})().catch(e=>{console.error(e);process.exit(1)});
