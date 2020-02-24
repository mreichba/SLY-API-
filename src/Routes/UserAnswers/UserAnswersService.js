const UserAnswersService = {

  // Gets the user answer to a specific question
  getUserAnswer(db, question_id, user_id) {
    return db('user_answers')
      .select(
        'user_answers.id',
        'answers.answer',
        'answers.answered',
        'questions.answered AS question_answered'
      )
      .join(
        'answers',
        'user_answers.answer_id',
        'answers.id'
      )
      .join(
        'questions',
        'user_answers.question_id',
        'questions.id'
      )
      .where('user_answers.question_id', question_id)
      .where('user_answers.user_id', user_id);
  },

  // Increases the questions answered value by 1
  increaseQuestionAnswered(db, question_id) {
    db('questions')
      .where('id', question_id)
      .increment('answered', 1);
  },

  // Increases the answers answered value by 1
  increaseAnswerAnswered(db, answer_id) {
    db('answers')
      .where('id', answer_id)
      .increment('answered', 1);
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