const AnswersService = {
  // Gets the answers for a specific question
  getQuestionAnswers(db, question_id) {
    return db('answers')
      .select('*')
      .where('question_id', question_id);
  },
  // Returns the answer value based on the answer_id
  getAnswer(db, id) {
    return db('answers')
      .pluck('answer')
      .where({ id });
  },
  // Checks if the user's id matches with the question_id in the user answers table to see if theyve completed the quiz and submitted their answer
  checkIfCompleted(db, question_id, user_id) {
    return db('user_answers')
      .select('id')
      .where({ question_id })
      .andWhere({ user_id });
  },
  // Returns the users answer for a particular question
  answer(db, question_id, user_id) {
    return db('user_answers')
      .pluck('answer_id')
      .where({ question_id })
      .andWhere({ user_id });
  }
};

module.exports = AnswersService;
