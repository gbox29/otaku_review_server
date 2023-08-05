module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id:  {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true, // Validates that the value is a valid email address
            },
        }, 
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [8],
                    msg: "Password must be at least 8 characters long.", // Custom validation message
                },
            },
        },
        salt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        typeofuser: {
            type: DataTypes.STRING,
            allowNull: false,
        } 
    });
    
    return User;
}