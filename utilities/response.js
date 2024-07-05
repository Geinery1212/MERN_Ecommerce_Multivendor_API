module.exports.response = (res, code, data) => {
    return res.status(code).json(data);
}