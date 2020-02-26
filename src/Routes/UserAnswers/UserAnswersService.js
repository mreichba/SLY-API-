const UserAnswersService = {

  // Gets the user answer to a specific question
  getUserAnswer(db, questionId, userId) {
    return db('user_answers')
      .select('*')
      .where('question_id', questionId)
      .where('user_id', userId);
  },

  // Increases the questions answered value by 1
  getQuestionAnswered(db, question_id) {
    return db('user_answers')
      .count('question_id')
      .where('question_id', question_id);
  },

  // Increases the answers answered value by 1
  getAnswerSelected(db, answer_id) {
    return db('user_answers')
      .count('answer_id')
      .where('answer_id', answer_id);
  },

  // Inserts answer into the database
  insertUserAnswer(db, newUserAnswer) {
    return db('user_answers')
      .insert(newUserAnswer)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  }
};

module.exports = UserAnswersService;