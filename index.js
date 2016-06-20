var _ = require('underscore'),
    GeographicLib = require("geographiclib");

var geod = GeographicLib.Geodesic.WGS84;

function GeoIntersectCircles(a, b, c, h) {
    var f = GeodesicInverse(a, c);
    if (Math.abs(b + h - f.dist) < 1 || Math.abs(Math.abs(b - h) - f.dist) < 1) {
        return [GeodesicDirect(a, f.startbrng, b)]
    }
    if (f.dist < Math.abs(b - h) || f.dist > b + h) {
        return null
    }
    var d = toXyz(a);
    var i = toXyz(c);
    var j = toXyz(GeodesicDirect(a, 0, b));
    var l = toXyz(GeodesicDirect(c, 0, h));
    var k = Math.sqrt((d.x - j.x) * (d.x - j.x) + (d.y - j.y) * (d.y - j.y) + (d.z - j.z) * (d.z - j.z));
    var n = Math.sqrt((i.x - l.x) * (i.x - l.x) + (i.y - l.y) * (i.y - l.y) + (i.z - l.z) * (i.z - l.z));
    var m = d.y * i.z - i.y * d.z;
    var o = d.z * i.x - i.z * d.x;
    var q = d.x * i.y - i.x * d.y;
    var p = m * m + o * o + q * q;
    if (p === 0) {
        return null
    }
    var r = d.x * (81179511356162 - n * n) - i.x * (81179511356162 - k * k);
    var s = d.y * (81179511356162 - n * n) - i.y * (81179511356162 - k * k);
    var t = d.z * (81179511356162 - n * n) - i.z * (81179511356162 - k * k);
    var w = 162359022712324 * p - (s * s + t * t + r * r);
    if (w < 0) {
        return null
    }
    var z = (o * t - q * s + m * Math.sqrt(w)) / (2 * p);
    var v = (q * r - m * t + o * Math.sqrt(w)) / (2 * p);
    var u = (m * s - o * r + q * Math.sqrt(w)) / (2 * p);
    var A = (o * t - q * s - m * Math.sqrt(w)) / (2 * p);
    var B = (q * r - m * t - o * Math.sqrt(w)) / (2 * p);
    var C = (m * s - o * r - q * Math.sqrt(w)) / (2 * p);
    var D = Math.asin(u / Math.sqrt(z * z + v * v + u * u)) * 180 / Math.PI;
    var y = Math.atan2(v, z) * 180 / Math.PI;
    var x = Math.asin(C / Math.sqrt(A * A + B * B + C * C)) * 180 / Math.PI;
    var G = Math.atan2(B, A) * 180 / Math.PI;
    var E, H, F;
    for (E = 0; E < 10; E++) {
        d = AzimuthalEquidistantForward(D, y, a.lat, a.lng);
        i = AzimuthalEquidistantForward(D, y, c.lat, c.lng);
        F = intersectCirclesEAP(d, b, i, h);
        H = AzimuthalEquidistantReverse(D, y, F.x, F.y);
        D = H.lat;
        y = H.lng
    }
    for (E = 0; E < 10; E++) {
        d = AzimuthalEquidistantForward(x, G, a.lat, a.lng);
        i = AzimuthalEquidistantForward(x, G, c.lat, c.lng);
        F = intersectCirclesEAP(d, b, i, h);
        H = AzimuthalEquidistantReverse(x, G, F.x, F.y);
        x = H.lat;
        G = H.lng
    }
    return [{'lat': D, 'lng': y}, {'lat': x, 'lng': G}]
}

function GeodesicInverse(a, b) {
    var c = geod.Inverse(a.lat, a.lng, b.lat, b.lng);
    if (c.azi1 < 0) {
        c.azi1 += 360
    }
    if (c.azi2 < 0) {
        c.azi2 += 360
    }
    return {'startbrng': c.azi1, 'endbrng': c.azi2, 'dist': c.s12}
}

function GeodesicDirect(a, b, c) {
    var h = geod.Direct(a.lat, a.lng, b, c);
    if (h.azi2 < 0) {
        h.azi2 += 360
    }
    return {'lat': h.lat2, 'lng': h.lon2, 'startbrng': b, 'endbrng': h.azi2}
}

function toXyz(a) {
    var b = a.lat * Math.PI / 180;
    var c = a.lng * Math.PI / 180;
    var h = 6371009 * Math.cos(c) * Math.cos(b);
    var f = 6371009 * Math.sin(c) * Math.cos(b);
    var d = 6371009 * Math.sin(b);
    return ({'x': h, 'y': f, 'z': d})
}

function AzimuthalEquidistantForward(a, b, c, h) {
    var f = geod.Inverse(a, b, c, h);
    f.azi1 *= 0.017453292519943295;
    return {'x': f.s12 * Math.sin(f.azi1), 'y': f.s12 * Math.cos(f.azi1)}
}

function AzimuthalEquidistantReverse(a, b, c, h) {
    var f = Math.atan2(c, h) / 0.017453292519943295;
    var d = GeographicLib.Math.hypot(c, h);
    var i = geod.Direct(a, b, f, d);
    return {'lat': i.lat2, 'lng': i.lon2}
}

function intersectCirclesEAP(a, b, c, h) {
    var f = c.x - a.x;
    var d = c.y - a.y;
    var i = Math.sqrt(f * f + d * d);
    var j = (i * i + b * b - h * h) / (2 * i);
    var l = Math.sqrt(b * b - j * j);
    var k = a.x + f * j / i + (d / i) * l;
    var n = a.y + d * j / i - (f / i) * l;
    var m = a.x + f * j / i - (d / i) * l;
    var o = a.y + d * j / i + (f / i) * l;
    if (Math.sqrt(k * k + n * n) < Math.sqrt(m * m + o * o)) {
        return {'x': k, 'y': n}
    }
    return {'x': m, 'y': o}
}

function intersect(data) {
    var circles = {};

    for (var i = 0; i < data.length; i++) {
        circles[i] = data[i];
    }

    if (data.length < 2) {
        return circles;
    }

    var mapIntersects = {};

    // intersect all circles with eachother
    for (var i = 0, length = Object.keys(circles).length; i < length; i++) {
        for (var n = i + 1; n < length; n++) {
            if (Math.round(GeodesicInverse(circles[i], circles[n]).dist) <= circles[i].r + circles[n].r) {
                mapIntersects[i] = mapIntersects[i] || [];
                mapIntersects[n] = mapIntersects[n] || [];
                mapIntersects[i].push(n);
                mapIntersects[n].push(i);
            }
        }
    }

    var groups = {};

    for (var i = 0, length = Object.keys(mapIntersects).length; i < length; i++) {
        var child = mapIntersects[i];
        var root = mapIntersects[i].concat(i);
        for (var n = i; n < child.length; n++) {
            var subchildOfRoot = mapIntersects[child[n]].concat(child[n]);
            var minRequire = Math.min(root.length, subchildOfRoot.length);

            if (_.intersection(root, subchildOfRoot).length == minRequire) {
                var key = root.length == minRequire ? root.sort() : subchildOfRoot.sort();
                groups[key] = groups[key] || [];
                if (groups[key].indexOf(i) == -1) {
                    groups[key].push(i);
                }
                if (groups[key].indexOf(child[n]) == -1) {
                    groups[key].push(child[n])
                }
            }
        }
    }

    var points = {};

    for (var key in groups) {
        var pairs = []
        for (var i = 0; i < groups[key].length; i++) {
            for (var n = i + 1; n < groups[key].length; n++) {
                pairs.push([groups[key][i], groups[key][n]]);
            }
        }
        points[key] = [];
        for (var i = 0; i < pairs.length; i++) {
            var c1Index = pairs[i][0];
            var c2Index = pairs[i][1];
            var twoPoints = GeoIntersectCircles({
                lat: circles[c1Index].lat,
                lng: circles[c1Index].lng
            }, circles[c1Index].r, {lat: circles[c2Index].lat, lng: circles[c2Index].lng}, circles[c2Index].r);
            if (!twoPoints) continue;
            if (twoPoints.length == 2) {
                points[key].push(twoPoints[0]);
                points[key].push(twoPoints[1]);
            } else {
                points[key].push(twoPoints[0]);
            }
        }
    }

    var finalPoints = {};

    for (var groupName in points) {
        var _circles = groups[groupName];
        var _points = points[groupName];

        for (var i = 0; i < _points.length; i++) {
            var inside = true;
            for (var n = 0; n < _circles.length; n++) {
                if (Math.round(GeodesicInverse(_points[i], circles[_circles[n]]).dist) > Math.round(circles[_circles[n]].r)) {
                    inside = false;
                }
            }
            if (inside) {
                finalPoints[groupName] = finalPoints[groupName] || [];
                finalPoints[groupName].push(_points[i]);
            }
        }
    }

    return finalPoints
}

module.exports = intersect;