const sendRefreshToken = (res, token) => {
  res.cookie('gfrt', token, {
    expires: new Date(Date.now() + 168 * 3600000), // cookie will be removed after 7 days
    httpOnly: true,
    path: '/refresh_token',
  });
};

exports.sendRefreshToken = sendRefreshToken;
