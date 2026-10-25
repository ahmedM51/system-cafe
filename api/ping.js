// TEMPORARY diagnostic endpoint used to pinpoint the Vercel 500.
// Plain CommonJS so Vercel applies no TypeScript transform to it.
module.exports = function handler(req, res) {
  const out = {
    ok: true,
    node: process.version,
    time: new Date().toISOString(),
    reqUrl: req.url,
    cwd: process.cwd(),
    requireType: typeof require,
  };

  try {
    out.express = typeof require('express');
  } catch (e) {
    out.expressError = (e && e.message) || String(e);
  }

  try {
    require('express')();
    out.expressApp = 'created';
  } catch (e) {
    out.expressAppError = (e && e.message) || String(e);
  }

  try {
    require('mongodb');
    out.mongodb = 'loaded';
  } catch (e) {
    out.mongodbError = (e && e.message) || String(e);
  }

  try {
    out.serverMongo = typeof require('../server/mongodb').createMongoApiRouter;
  } catch (e) {
    out.serverMongoError = (e && e.message) || String(e);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(out, null, 2));
};
