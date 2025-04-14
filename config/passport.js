const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          // Nếu người dùng chưa tồn tại, tạo mới
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            avatar: profile.photos[0].value,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            isVerified: true, // Tự động xác thực email khi đăng nhập bằng Google
          });
        } else {
          // Cập nhật thông tin nếu người dùng đã tồn tại
          user.googleAccessToken = accessToken;
          user.googleRefreshToken = refreshToken;
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

// Serialize và Deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
