const assert=require('node:assert/strict');
const B=require('../booking-links.js');
const config=require('../booking-config.js');
assert.equal(config.externalUrl,'');
assert.deepEqual(B.resolve(config),{mode:'demo',href:'reservation.html'});
assert.equal(B.resolve({}, {menu:'magnet',design:'moon'}).href,'reservation.html?menu=magnet&design=moon');
for(const externalUrl of ['', '  ', 'javascript:alert(1)', 'data:text/html,test', 'http://example.com', '/booking', 'https://user:pass@example.com', 'not a URL', null, 42]){
 assert.equal(B.resolve({externalUrl},{menu:'one'}).href,'reservation.html?menu=one',String(externalUrl));
}
for(const externalUrl of ['https://example.com/book?salon=lueur#schedule','https://another.example/reserve/']){
 assert.deepEqual(B.resolve({externalUrl:' '+externalUrl+' '},{menu:'one',design:'moon',name:'personal'}),{mode:'external',href:externalUrl});
}
assert.equal(B.resolve({}, {menu:'one&email=x',design:'<script>',email:'private'}).href,'reservation.html');
assert.equal(B.resolve().mode,'demo');
console.log('PASS: external configuration, provider changes, exact vendor URLs, safe demo fallback, demo selection parameters.');
