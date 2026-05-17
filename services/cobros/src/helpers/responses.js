function ok(res, result, status = 200) {
  return res.status(status).json({ ok: true, result });
}

function fail(res, error, status = 400) {
  return res.status(status).json({ ok: false, error });
}

module.exports = { ok, fail };