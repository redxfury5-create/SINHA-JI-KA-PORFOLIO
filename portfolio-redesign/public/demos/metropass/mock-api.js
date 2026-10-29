/* Browser-only stand-in for the MetroPass Spring Boot API (same routes, seed data and
   fare/booking rules as MetroController and DataInitializer). Nothing leaves the page. */
(function () {
  try { localStorage.removeItem('metroUser'); } catch (e) {}
  var H = 36e5, D = 24 * H, now = new Date();
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var dt = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  var dd = function (d) { return dt(d).slice(0, 10); };
  var plus = function (d, ms) { return new Date(d.getTime() + ms); };
  var uid = function (p) { return p + Math.random().toString(16).slice(2, 10).toUpperCase(); };
  var DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  var db = {
    users: [
      ['admin', 'Metro', 'Admin', 'admin123', 'ADMIN', 'admin@metro.local', 'ST-CEN'],
      ['rider1', 'Aarav', 'Mehta', 'rider123', 'USER', 'aarav@example.com', null],
      ['rider2', 'Mira', 'Shah', 'rider123', 'USER', 'mira@example.com', null],
      ['operator1', 'Neha', 'Rao', 'operator123', 'ADMIN', 'neha@metro.local', 'ST-AIR']
    ].map(function (u) { return { userId: u[0], firstName: u[1], lastName: u[2], password: u[3], role: u[4], contact: u[5], registrationDate: dd(now), isActive: true, hireDate: u[4] === 'ADMIN' ? dd(plus(now, -365 * D)) : null, stationId: u[6] }; }),
    stations: [
      ['ST-CEN', 'Central', 'City Center', '#2f80ed', 28.6139, 77.2090],
      ['ST-UNI', 'University', 'North Campus', '#2f80ed', 28.6870, 77.2090],
      ['ST-MKT', 'Market', 'Civic Market', '#f2994a', 28.6304, 77.2177],
      ['ST-AIR', 'Airport', 'Terminal Gateway', '#27ae60', 28.5562, 77.1000],
      ['ST-RIV', 'Riverside', 'River Walk', '#bb6bd9', 28.6100, 77.2400]
    ].map(function (s) { return { stationId: s[0], stationCode: s[1], address: s[2], lineColor: s[3], latitude: s[4], longitude: s[5], openedDate: dd(plus(now, -1095 * D)), isActive: true }; }),
    routes: [
      ['RT-BLUE', 'Blue Line', 'ST-UNI', 'ST-CEN', '#2f80ed', 18.5, 34],
      ['RT-ORANGE', 'Airport Express', 'ST-CEN', 'ST-AIR', '#f2994a', 22.0, 28],
      ['RT-GREEN', 'River Connector', 'ST-MKT', 'ST-RIV', '#27ae60', 9.8, 16]
    ].map(function (r) { return { routeId: r[0], routeName: r[1], startStationId: r[2], endStationId: r[3], lineColor: r[4], totalDistance: r[5], estimatedTime: r[6], createdAt: dt(now), updatedAt: dt(now) }; }),
    fares: [['FR-01', 'ST-CEN', 'ST-UNI', 25], ['FR-02', 'ST-CEN', 'ST-MKT', 18], ['FR-03', 'ST-CEN', 'ST-AIR', 60], ['FR-04', 'ST-MKT', 'ST-RIV', 22], ['FR-05', 'ST-UNI', 'ST-AIR', 70], ['FR-06', 'ST-RIV', 'ST-CEN', 28]]
      .map(function (f) { return { fareId: f[0], sourceStationId: f[1], destStationId: f[2], baseFare: f[3] }; }),
    trains: [['TR-101', '101', 1200, 6, 2019], ['TR-102', '102', 1200, 6, 2020], ['TR-103', '103', 900, 4, 2022]]
      .map(function (t) { return { trainId: t[0], trainNumber: t[1], capacity: t[2], totalCoaches: t[3], manufactureYear: t[4], createdAt: dt(now), isActive: true }; }),
    'route-stations': [], schedules: [], payments: [], tickets: [],
    'metro-cards': [['MC-1001', 'rider1', 500], ['MC-1002', 'rider2', 150]]
      .map(function (c) { return { cardId: c[0], passengerId: c[1], balance: c[2], issueDate: dd(plus(now, -60 * D)), expiryDate: dd(plus(now, 1095 * D)), createdAt: dt(now), isActive: true }; }),
    'maintenance-issues': [{ issueId: 'MI-01', trainId: 'TR-103', stationId: 'ST-MKT', reportedBy: 'operator1', issueType: 'Door sensor fault', description: 'Door sensor on coach 2 intermittently failing to close.', status: 'OPEN', priority: 'MEDIUM', createdAt: dt(plus(now, -D)), resolvedAt: null }]
  };
  var rsId = 0;
  [['RT-BLUE', 'ST-UNI', 1], ['RT-BLUE', 'ST-CEN', 2], ['RT-ORANGE', 'ST-CEN', 1], ['RT-ORANGE', 'ST-AIR', 2], ['RT-GREEN', 'ST-MKT', 1], ['RT-GREEN', 'ST-CEN', 2], ['RT-GREEN', 'ST-RIV', 3]]
    .forEach(function (s) { db['route-stations'].push({ id: ++rsId, routeId: s[0], stationId: s[1], sequenceNumber: s[2] }); });
  [['RT-BLUE', 'TR-101', 7, '01'], ['RT-ORANGE', 'TR-102', 8, '02'], ['RT-GREEN', 'TR-103', 9, '03']].forEach(function (s) {
    var route = db.routes.filter(function (r) { return r.routeId === s[0]; })[0];
    DAYS.forEach(function (day, idx) {
      var date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      date.setDate(date.getDate() + ((idx - date.getDay() + 7) % 7));
      var dep = new Date(date.getFullYear(), date.getMonth(), date.getDate(), s[2], 0, 0);
      db.schedules.push({ scheduleId: day === 'MONDAY' ? 'SCH-' + s[3] : 'SCH-' + s[0].replace('RT-', '') + '-' + day, trainId: s[1], routeId: s[0], dayOfWeek: day, scheduledDeparture: dt(dep), scheduledArrival: dt(plus(dep, route.estimatedTime * 6e4)), validFrom: dd(now), validTo: dd(plus(now, 180 * D)), isActive: true, createdAt: dt(now) });
    });
  });
  db.tickets.push({ ticketId: 'T-DEMO-01', passengerId: 'rider1', fareId: 'FR-01', sourceStationId: 'ST-CEN', destStationId: 'ST-UNI', ticketType: 'SINGLE', passengerCount: 1, issueTime: dt(plus(now, -2 * H)), createdAt: dt(plus(now, -2 * H)), validUntil: dt(plus(now, 22 * H)), isUsed: false });
  db.payments.push({ paymentId: 'P-DEMO-01', ticketId: 'T-DEMO-01', amount: 25, createdAt: dt(plus(now, -2 * H)) });

  var keys = { users: 'userId', stations: 'stationId', routes: 'routeId', fares: 'fareId', tickets: 'ticketId', payments: 'paymentId', trains: 'trainId', schedules: 'scheduleId', 'metro-cards': 'cardId', 'route-stations': 'id', 'maintenance-issues': 'issueId' };
  var fail = function (status, message) { var e = new Error(message); e.status = status; return e; };
  var findFare = function (a, b) {
    return db.fares.filter(function (f) { return f.sourceStationId === a && f.destStationId === b; })[0] ||
      db.fares.filter(function (f) { return f.sourceStationId === b && f.destStationId === a; })[0] || null;
  };
  function shortestPath(from, to) {
    var active = {}; db.stations.forEach(function (s) { if (s.isActive) active[s.stationId] = true; });
    var graph = {};
    db.routes.forEach(function (r) {
      var stops = db['route-stations'].filter(function (x) { return x.routeId === r.routeId; }).sort(function (a, b) { return (a.sequenceNumber || 1e9) - (b.sequenceNumber || 1e9); });
      for (var i = 1; i < stops.length; i++) {
        var a = stops[i - 1].stationId, b = stops[i].stationId;
        if (!a || !b || a === b || !active[a] || !active[b]) continue;
        (graph[a] = graph[a] || []).push({ from: a, to: b }); (graph[b] = graph[b] || []).push({ from: b, to: a });
      }
    });
    var queue = [from], seen = {}, prev = {}; seen[from] = true;
    while (queue.length) {
      var cur = queue.shift(); if (cur === to) break;
      (graph[cur] || []).forEach(function (e) { if (!seen[e.to]) { seen[e.to] = true; prev[e.to] = e; queue.push(e.to); } });
    }
    if (!seen[to]) return [];
    var path = [], c = to; while (c !== from) { var e = prev[c]; path.unshift(e); c = e.from; }
    return path;
  }
  function booking(r) {
    if (!r || !r.passengerId || !r.sourceStationId || !r.destStationId) throw fail(400, 'Passenger, source station, and destination station are required.');
    if (r.sourceStationId === r.destStationId) throw fail(400, 'Source and destination stations must be different.');
    var count = r.passengerCount == null ? 1 : r.passengerCount;
    if (count < 1 || count > 4) throw fail(400, 'Passenger count must be between 1 and 4.');
    var type = String(r.ticketType || 'SINGLE').trim().toUpperCase();
    if (['SINGLE', 'RETURN', 'DAY_PASS'].indexOf(type) < 0) throw fail(400, 'Choose a valid ticket type.');
    var user = db.users.filter(function (u) { return u.userId === r.passengerId; })[0];
    if (!user) throw fail(400, 'The selected passenger does not exist.');
    if (!user.isActive || String(user.role).toUpperCase() === 'ADMIN') throw fail(400, 'Choose an active passenger account.');
    var src = db.stations.filter(function (s) { return s.stationId === r.sourceStationId; })[0];
    var dst = db.stations.filter(function (s) { return s.stationId === r.destStationId; })[0];
    if (!src) throw fail(400, 'The source station does not exist.');
    if (!dst) throw fail(400, 'The destination station does not exist.');
    if (!src.isActive || !dst.isActive) throw fail(400, 'Both stations must be open to book a journey.');
    var path = shortestPath(src.stationId, dst.stationId);
    if (!path.length) throw fail(400, 'No connected metro route exists between these stations.');
    var direct = findFare(src.stationId, dst.stationId), ref = direct && direct.baseFare > 0 ? direct : null, one = 0;
    if (ref) one = ref.baseFare; else path.forEach(function (e) {
      var f = findFare(e.from, e.to);
      if (!f || !(f.baseFare > 0)) throw fail(400, 'A fare is missing for part of this journey. Please contact the metro administrator.');
      one += f.baseFare; if (!ref) ref = f;
    });
    var total = Math.round(one * (type === 'RETURN' ? 2 : type === 'DAY_PASS' ? 3 : 1) * count * 100) / 100;
    var t = new Date(), end = type === 'RETURN' ? plus(t, 24 * H) : type === 'DAY_PASS' ? new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59) : plus(t, 2 * H);
    var ticket = { ticketId: uid('T-'), passengerId: user.userId, fareId: ref ? ref.fareId : null, sourceStationId: src.stationId, destStationId: dst.stationId, ticketType: type, passengerCount: count, issueTime: dt(t), createdAt: dt(t), validUntil: dt(end), isUsed: false };
    var payment = { paymentId: uid('P-'), ticketId: ticket.ticketId, amount: total, createdAt: dt(t) };
    db.tickets.push(ticket); db.payments.push(payment);
    return { ticket: ticket, payment: payment, amount: total };
  }
  function handle(path, method, body) {
    var p = path.split('?')[0].split('/').map(decodeURIComponent), res = p[0];
    if (res === 'auth' && p[1] === 'signin') {
      var u = db.users.filter(function (x) { return x.userId === body.userId; })[0];
      if (!u || !u.isActive || !u.password || u.password !== body.password) throw fail(401, 'Invalid user ID or password');
      return [200, u];
    }
    if (res === 'auth' && p[1] === 'signup') {
      if (!body.userId || !body.password) throw fail(400, 'User ID and password are required');
      if (db.users.some(function (x) { return x.userId === body.userId; })) throw fail(409, 'User ID already exists');
      body.role = body.role || 'USER'; body.registrationDate = body.registrationDate || dd(now); body.isActive = true; db.users.push(body);
      return [201, body];
    }
    if (res === 'bookings' && method === 'POST') return [201, booking(body)];
    if (res === 'users' && p[2] === 'tickets') return [200, db.tickets.filter(function (x) { return x.passengerId === p[1]; })];
    if (res === 'routes' && p[2] === 'stations') return [200, db['route-stations'].filter(function (x) { return x.routeId === p[1]; }).sort(function (a, b) { return a.sequenceNumber - b.sequenceNumber; })];
    if (res === 'routes' && p[2] === 'stops') {
      var stops = db['route-stations'].filter(function (x) { return x.routeId === p[1]; }).sort(function (a, b) { return a.sequenceNumber - b.sequenceNumber; });
      if (method === 'POST') {
        if (!db.routes.some(function (r) { return r.routeId === p[1]; })) throw fail(404, 'Route not found');
        var st = db.stations.filter(function (s) { return s.stationId === body.stationId; })[0];
        if (!st) throw fail(400, 'Station not found.');
        if (!st.isActive) throw fail(400, 'A closed station cannot be added to a route.');
        if (stops.some(function (x) { return x.stationId === body.stationId; })) throw fail(409, 'This station is already on the route.');
        var seq = body.sequenceNumber;
        if (stops.length < 2 || seq < 2 || seq > stops.length) throw fail(400, "Insert a new stop between the route's existing endpoints.");
        stops.forEach(function (x) { if (x.sequenceNumber >= seq) x.sequenceNumber++; });
        var created = { id: ++rsId, routeId: p[1], stationId: st.stationId, sequenceNumber: seq }; db['route-stations'].push(created);
        return [201, created];
      }
      if (method === 'DELETE') {
        var idx = stops.findIndex(function (x) { return String(x.id) === p[3]; });
        if (idx < 0) throw fail(404, 'Route stop not found');
        if (stops.length <= 2 || idx === 0 || idx === stops.length - 1) throw fail(400, 'Route endpoints must remain in place; only intermediate stops can be removed.');
        db['route-stations'] = db['route-stations'].filter(function (x) { return String(x.id) !== p[3]; }); stops.splice(idx, 1);
        stops.forEach(function (x, i) { x.sequenceNumber = i + 1; });
        return [204, null];
      }
    }
    var key = keys[res]; if (!key) throw fail(404, 'Not found');
    var list = db[res];
    if (method === 'GET') return [200, list];
    if (method === 'POST') { if (res === 'route-stations') body.id = ++rsId; list.push(body); return [201, body]; }
    var id = p[1], i = list.findIndex(function (x) { return String(x[key]) === id; });
    if (method === 'PUT') {
      if (res === 'users') {
        if (i < 0) throw fail(404, 'User not found');
        var ex = list[i]; Object.keys(body).forEach(function (k) { if (body[k] != null && !(k === 'password' && !body[k])) ex[k] = body[k]; }); ex.isActive = body.isActive; return [200, ex];
      }
      body[key] = res === 'route-stations' ? Number(id) : id; if (i >= 0) list[i] = body; else list.push(body); return [200, body];
    }
    if (method === 'DELETE') {
      if (res === 'tickets') db.payments = db.payments.filter(function (x) { return x.ticketId !== id; });
      if (i >= 0) list.splice(i, 1); return [204, null];
    }
    throw fail(405, 'Method not allowed');
  }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, opts) {
    var url = typeof input === 'string' ? input : input.url;
    if (url.indexOf('/api/') !== 0) return realFetch(input, opts);
    var method = String((opts && opts.method) || 'GET').toUpperCase();
    var body = opts && opts.body ? JSON.parse(opts.body) : null;
    return new Promise(function (resolve) {
      setTimeout(function () {
        var out;
        try {
          var r = handle(url.slice(5), method, body);
          out = new Response(r[1] === null ? null : JSON.stringify(JSON.parse(JSON.stringify(r[1]))), { status: r[0], headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
          out = new Response(JSON.stringify({ message: e.message }), { status: e.status || 500, headers: { 'Content-Type': 'application/json' } });
        }
        resolve(out);
      }, 160 + Math.random() * 180);
    });
  };
})();
