var collision = require('./index.js');

var coors = [
    {lat: 41.3835, lng: 2.1704006, r: 30},
    {lat: 41.383183, lng: 2.1702075, r: 30},
    {lat: 41.383217, lng: 2.170508, r: 30},
    {lat: 41.383434, lng: 2.169775, r: 30}
];

var result = collision(coors);

console.log(JSON.stringify(result))