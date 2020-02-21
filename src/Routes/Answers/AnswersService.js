const AnswersService = {

  // Gets the answers for a specific question
  getQuestionAnswers(db, question_id) {
    return db('answers')
      .select('*')
      .where('question_id', question_id);
  }
}

module.exports = AnswersService;