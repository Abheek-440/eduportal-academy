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

    const candidateModels = [
      "groq/compound-mini",
      "groq/compound",
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "qwen/qwen3.6-27b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant"
    ];
    let response = null;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        response = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: `available courses:\n${courseList}`,
            },
            {
              role: "user",
              content: message,
            },
          ],
        });
        if (response && response.choices && response.choices[0]?.message?.content) break;
      } catch (e) {
        console.warn(`Groq chatbot model '${model}' failed: ${e.message}`);
        lastError = e;
      }
    }

    if (!response) {
      return res.status(500).json({
        reply: "Failed to generate AI response: " + (lastError?.message || "Service unavailable"),
      });
    }

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Internal server error" });
  }
};