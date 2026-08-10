const Groq = require("groq-sdk");
const Course = require("../models/Course");

exports.coursechatbot = async (req,res)=>{
    const groq = new Groq({
        apiKey: (process.env.GROQ_API_KEY || "").trim(),
    });
    try {
        const {message} = req.body;
        const courses = await Course.find().limit(30);
        if(courses.length === 0) {
            return res.status(200).json({
                reply:"NO COURSE FOUND,PLEASE ADD COURSE..",
            });
        }
        
        const courseList = courses.map((course,index)=>{
            return `
            
            ${index+1}. course title: ${course.title}
            category: ${course.category}
            price:${course.price}
            duration:${course.duration}
            Instructor: ${course.instructor}
            Description:${course.description}
         `;
    })
    .join("\n");

    const response = await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        messages:[
            {
                role:"system",
                content:`
                available courses:
                ${courseList}
                `,

            },
            {
                role:"user",
                content:message,
            },
        ],
    });
    res.json({
        reply:response.choices[0].message.content,
    });
        
    } catch(err){
        console.error(err);
    }
};