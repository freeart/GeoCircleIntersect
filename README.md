# GeoCircleIntersect

var coors = [
    {lat: 41.3835, lng: 2.1704006, r: 30},
    {lat: 41.383183, lng: 2.1702075, r: 30},
    {lat: 41.383217, lng: 2.170508, r: 30},
    {lat: 41.383434, lng: 2.169775, r: 30}
];

var result = gci(coors);

result == {
        "0,1,2,3": [{"lat": 41.3832554790171, "lng": 2.170553002397963}, {
            "lat": 41.3834275205284,
            "lng": 2.1700550964769985
        }],
        "0,1,2": [{"lat": 41.38329625003663, "lng": 2.170165128485208}, {
            "lat": 41.3832554790171,
            "lng": 2.170553002397963
        }, {"lat": 41.383441970282234, "lng": 2.170309484875125}],
        "0,1,3": [{"lat": 41.38334026840745, "lng": 2.1701113704849173}, {
            "lat": 41.3834275205284,
            "lng": 2.1700550964769985
        }, {"lat": 41.383447264800246, "lng": 2.1701332228720718}]
    }

"0,1,2,3" is a unique group name of intersect of 2 circles (0 and 1) - simple line
"0,1,2" is a unique group name of intersect of 3 circles (0, 1 and 2) who has 3 common points - big poligon
"0,1,3" is a unique group name of intersect of 3 circles (0, 1 and 3) who has 3 common points - small poligon
