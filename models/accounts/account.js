        const { mongoose, ObjectId } = require("../../utils/utils");
        /* <<<// Documentation >>>

        1- us_In = user_initiate
        2- ad_Ti = Add Time
        3- ro_Ma = Roles Manager
        4- ne_Id = Network Id
        5- pa_Id = Package Id
        6- pa_Pr = packagePrice
        7- op_Nu = Operation Number
        8- bu_Us_Ar = Buyer User  Area
        9- fr_Us = From User
        10- st = Status
        11- am = Amount
        12- no = Notice
        13- to_Us = To User
        14- ca_Nm = Card Number 
        15- pa = password  
        16- se_Nu = Serial Number
        17- pa_Da = Paying Date
        18- de_St = Device Status
        19- us_Id = User Id
        20- ba_Se = Bad Search
        21- ro_Pro_Ne = Roles  Profile Network
        22- ro_Ca = Roles Cards
        23- ro_Ot = Roles Othres
        24 - ro_Pa = Roles Packages
        */

        const incomeSchema = new mongoose.Schema({
        no: { type: String, required: false },
        am: { type: Number, min: 0, required: true, trim: true },
        st: {
        type: String,
        required: true,
        trim: true,
        enum: ["transfer", "buyCard", "commission"],
        },
        fr_Us: { type: ObjectId, ref: "User", required: false, trim: true },
        pa_Pr: { type: Number, required: false, trim: true },
        op_Nu: { type: Number, trim: true },
        pa_Id: { type: ObjectId, ref: "Package", required: false },
        bu_Us_Ar: {
        type: String,
        required: false,
        } /* ينفع بفلتره صاحب الشبكة علا حسب المنطقة */,
        pa_Da: Date,
        });

        const outcomeSchema = new mongoose.Schema({
        no: { type: String, required: false },
        am: { type: Number, required: true, trim: true },
        st: {
        type: String,
        required: false,
        enum: ["transfer", "buyCard", "commission"],
        },
        to_Us: { type: ObjectId, ref: "User", required: false },
        pa_Id: { type: ObjectId, ref: "Package", required: false },
        ca_Nu: { type: String, required: true, trim: true },
        pa: { type: String, required: true, trim: true },
        se_Nu: { type: String, required: true, trim: true },
        pa_Pr: { type: Number, required: false, trim: true },
        card: { type: ObjectId, ref: "cards", required: false, trim: true },
        pa_Da: Date,
        de_St: { type: ObjectId, ref: "devices_status", required: false },
        op_Nu: { type: Number },
        });
        const AccountsSchema = mongoose.Schema(
        {
        inCome: [incomeSchema],
        outCome: [outcomeSchema],
        ne_Id: { type: ObjectId, ref: "networks" },
        us_Id: { type: ObjectId, ref: "User" },
        ro_Ca:{ type: ObjectId, ref: "roles_card", required: false },
        ro_Ot:{ type: ObjectId, ref: "roles_Othre", required: false },
        ro_Pa:{ type: ObjectId, ref: "roles_Package", required: false },
        ro_Pro_Ne:{ type: ObjectId, ref: "roles_Pro_network", required: false },
        ba_Se:[] /* هنا يتم خون البيانات التي لا يريدها هذا المستخدم الضهور له في قائمة الكلمات المقترحة للبحث */,
        },

        { timestamps: true, versionKey: false } //this versionKey: false for not save ( __v  ) in database
        );

        module.exports = mongoose.model("Account", AccountsSchema);
