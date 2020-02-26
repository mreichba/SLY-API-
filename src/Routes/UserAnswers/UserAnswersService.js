const UserAnswersService = {

  // Gets the user answer to a specific question
  getUserAnswer(db, question_id, user_id) {
    return db('user_answers')
      .select(
        'user_answers.id',
        'answers.answer',
        'user_answers.answer_id',
        'user_answers.question_id'
      )
      .join(
        'answers',
        'user_answers.answer_id',
        'answers.id'
      )
      .where('user_answers.question_id', question_id)
      .where('user_answers.user_id', user_id);
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