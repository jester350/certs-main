const pool = require('../db');

const date = require('date-and-time');

var offset = 0;
var count = 15;
var pagerStart=0;

console.log('cert controller');

module.exports.certsGetAll = function (request, response, next) {

    function countrec() {
        console.log("in select db func");
        return new Promise(function (resolve, reject) {
            pool.query('SELECT count(*) as rowcount \
        FROM cert INNER JOIN cert_system_junc ON cert.row_id = cert_system_junc.cert \
        inner join systems on systems.row_id = cert_system_junc.system', (err, res) => {
                    console.log(res.rows);
                    kev = 2;
                    if (err) return next(err);

                    console.log('render test after promise');
                
                return rowcount;

                    // resolve(res.rows[0].rowid);
                }
            )
        })
    };

    function readdb() {
        console.log("in select db func");
        return new Promise(function (resolve, reject) {
            pool.query('SELECT cert.row_id as rowid, cert.name as certname,cert.start_date as certStartDate,cert.expiry_date as certExpiryDate,systems.name as systemName \
        FROM cert INNER JOIN cert_system_junc ON cert.row_id = cert_system_junc.cert \
        inner join systems on systems.row_id = cert_system_junc.system ORDER BY certExpiryDate ASC', (err, res) => {
                    console.log(res.rows);
                    kev = 2;
                    if (err) return next(err);

                    if (request.query && request.query.offset) {
                        offset = parseInt(request.query.offset, 10);
                    }

                    if (request.query && request.query.count) {
                        count = parseInt(request.query.count, 10);
                    }
                    var today = new Date();
                    for (var i in res.rows) {

                        var daysLeft = date.subtract(res.rows[i].certexpirydate, today).toDays();
                        res.rows[i].daysleft = daysLeft;
                        var class_type = "alert alert-success";
                        if (daysLeft < 30) {
                            class_type = "alert alert-warning";
                        }
                        if (daysLeft < 7) {
                            class_type = "alert alert-danger";
                        }
                        res.rows[i].classtype=class_type;
                        sdate = date.format(res.rows[i].certstartdate, 'DD-MM-YYYY');
                        res.rows[i].certstartdate = sdate;

                        edate = date.format(res.rows[i].certexpirydate, 'DD-MM-YYYY');
                        res.rows[i].certexpirydate = edate;
                    }
                    res.rows[0].rowcount = "test";
                    page_cnt=Math.ceil(res.rows.length/count);
                    console.log('render test after promise '+res.rows.length);
                    recordDetails = {totalRecords: res.rows.length,recPerPage: count,pageCount: Math.ceil(res.rows.length/count),currentPage: offset,pagerStart: pagerStart};
                    console.log(recordDetails);
                    response
                        .render('list_certs', { data: res.rows.slice(offset,offset+count), recordDetails: recordDetails, title: 'Cert Database' });

                    resolve(res.rows[0].rowid);
                }
            )
        })
    };
    console.log("call db func");
    kev = "";
    rowcount=countrec();
    console.log("row count"+rowcount);
    readdb().then((rowid) => {
        console.log(rowid)//Value here is defined as u expect.
    });
    console.log("after db func");
};

module.exports.certsGetOne = function (request, response, next) {
    console.log("running get single cert...");
    const id = request.params.certId;

    pool.query('SELECT cert.name as certname,cert.start_date as certStartDate,cert.expiry_date as certExpiryDate,systems.name as systemname \
        FROM cert INNER JOIN cert_system_junc ON cert.row_id = cert_system_junc.cert \
        inner join systems on systems.row_id = cert_system_junc.system WHERE cert.row_id = $1', [id], (err, res) => {
            // pool.query('SELECT * FROM cert where row_id = $1', [id], (err, res) => {
            if (err) return next(err);
            var today = new Date();
            var sysname = res.rows[0].systemName;
            var sdate = date.format(res.rows[0].certstartdate, 'YYYY-MM-DD');
            var edate = date.format(res.rows[0].certexpirydate, 'YYYY-MM-DD');
            var daysLeft = date.subtract(res.rows[0].certexpirydate, today).toDays();
            var sysname = res.rows[0].systemname;
            response
                .render('getCert', { data: res.rows, title: 'Cert${certname}', sdate: sdate, edate: edate, sysname: sysname, dleft: daysLeft });
        });
};

module.exports.certsGetOne = function (request, response, next) {
    console.log("running get single cert...");
    const id = request.params.certId;

    pool.query('SELECT cert.name as certname,cert.start_date as certStartDate,cert.expiry_date as certExpiryDate,systems.name as systemname \
        FROM cert INNER JOIN cert_system_junc ON cert.row_id = cert_system_junc.cert \
        inner join systems on systems.row_id = cert_system_junc.system WHERE cert.row_id = $1', [id], (err, res) => {
            // pool.query('SELECT * FROM cert where row_id = $1', [id], (err, res) => {
            if (err) return next(err);
            var certname = res.rows[0].certname;
            var today = new Date();
            var sysname = res.rows[0].systemName;
            var sdate = date.format(res.rows[0].certstartdate, 'YYYY-MM-DD');
            var edate = date.format(res.rows[0].certexpirydate, 'YYYY-MM-DD');
            var daysLeft = date.subtract(res.rows[0].certexpirydate, today).toDays();
            var sysname = res.rows[0].systemname;
            response
                .render('getCert', { data: res.rows, title: 'Certificate: '+certname, sdate: sdate, edate: edate, sysname: sysname, dleft: daysLeft });
        });
};

module.exports.certAddOne = function (request, response, next) {
    console.log("POST new cert"); {
        pool.query('SELECT row_id as systemid, name as systemname from systems', (err, res) => {
            if (err) return next(err);
            console.log(res.rows);
            response
                .render('addCert', { data: res.rows, title: 'Add Cert' });
        })
    }
};

module.exports.certPost = function (request, response, next) {
    function insertcert(body) {
        console.log("insert command");
        console.log(body);
        console.log("body");
        var today = new Date();
        const { name, created_date, created_by, expiry_date, start_date, systems } = body;

        return new Promise(function (resolve, reject) {
            pool.query('INSERT INTO cert(name, created_date, created_by, expiry_date,start_date) VALUES($1, $2, $3, $4, $5)',
                [name, today, created_by, expiry_date, start_date],
                (err, res) => {
                    if (err) return next(err);
                    resolve(systems);
                    // response.redirect('/certs');
                }
            )
        })
    };

    function getmax() {
        console.log("get max");
        return new Promise(function (resolve, reject) {
            pool.query('select max(row_id) as max from cert', (err, res) => {
                if (err) return next(err);
                max = res.rows.max;
                resolve(res.rows.max);
                // response.redirect('/certs');
            }
            )
        })
    };

    insertcert(request.body).then((system) => {
        console.log(system);
        pool.query('select max(row_id) from cert', (err, res) => {
            if (err) return next(err);
            // console.log("max::");
            // console.log(res.rows[0].max);
            // console.log("done max 2" + system + ":" + res.rows[0].max)//Value here is defined as u expect.
            pool.query('INSERT INTO cert_system_junc(cert,system) VALUES($1, $2)',
                [res.rows[0].max, system],
                (err, res) => {
                    if (err) return next(err);
                })
        })

        pool.query('select max(row_id) from cert', (err, res) => {
            if (err) return next(err);
            response.redirect('/certs');
        })
    });
    // response.redirect('/certs');
};
