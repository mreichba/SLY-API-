// Create the questions service object
const QuestionsService = {
  // Gets all questions from the database
  getQuestions(db) {
    return db('questions').select('*');
  },

  // Gets paginated questions
  paginateQuestions(db, page, pSize) {
    // Set the offset for the page
    const offset = pSize * (page - 1);

    // Returns all of the questions within the appropriate page
    return db('questions')
      .select('*')
      .limit(pSize)
      .offset(offset);
  },

  // Gets a specific question
  getQuestion(db, id) {
    return db('questions')
      .select('*')
      .where({ id });
  },

  // Groups all the questions by topic and returns them
  groupByTopic(db) {
    return db
      .distinct()
      .from('questions')
      .select('topic');
  },

  // Returns all the User's completed quizzes
  getCompletedIds(db, user_id) {
    return db('user_answers')
      .pluck('question_id')
      .where({ user_id });
  },

  // Gets the questions for a specific topic
  getQuestionAnswers(db, topic) {
    return db('questions')
      .select('*')
      .where('topic', topic);
  }
};

module.exports = QuestionsService;
