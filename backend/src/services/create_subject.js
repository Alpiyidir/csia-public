const db = require("./database");

const create_subject_and_log_to_console = async (subjectName) => {
    try {
        await db.models.subject.create({ subject: subjectName });
        const subject = await db.models.subject.findOne({where: {subject: subjectName}})
        // Teacher key is the id field of the subject created, this will be printed
        console.log(subject.id);
    }
    catch (e) {
        console.log(`Error, subject not created: ${e.errors[0].message}`);
    }
    
}

create_subject_and_log_to_console("Mathematics");


