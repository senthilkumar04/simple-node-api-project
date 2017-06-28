var env = process.env.NODE_ENV || 'development';
console.log(`${env} environment`);
if (env === "development" || env === "test") {
    var config = require('./config.json');
    var configEnv = config[env];
    Object.keys(configEnv).forEach((key)=>{
        process.env[key] = configEnv[key];
    })
}