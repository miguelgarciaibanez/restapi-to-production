import bcrypt from 'bcrypt';
import { Schema, Document, model, Model } from 'mongoose';

import validator from 'validator';


interface IuserDocument extends Document {
    password:string,
    email: string,
    name: string,
    created: Date
}

export interface IUser extends IuserDocument {
    comparePassword(password:string):Promise<boolean>
}

const userSchema = new Schema<IUser>({
    password:{type:String, required:true},
    email:{ 
        type: String,
        required: true,
        trim:true,
        unique:true,
        validate:[validator.isEmail,'do not match email regex']
    },
    name:{type: String, required: true},
    created: { type:Date, default: Date.now}
}, {strict: true});

userSchema.index({email:1}, {unique: true});


userSchema.pre<IuserDocument>('save', async function(next){
    const user = this;
    if (!user.isModified()) return next();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password,salt);
    user.password = hash;
    next();
});

userSchema.set('toJSON',{
    transform: function( doc, ret, options ) {
        ret.created = ret.created.getTime();
        delete ret.__v;
        delete ret._id;
        delete ret.passwod;
    }
});

userSchema.methods.comparePassword = async function(password: string): Promise<boolean>{
    const res = await bcrypt.compare(password, this.password);
    return res;
}

export interface IUserModel extends Model<IUser> {
    // collection/docouments level operations (fetch one or many, update, save back to db)
  }

export const User: IUserModel = model<IUser, IUserModel>('User', userSchema)

export default User