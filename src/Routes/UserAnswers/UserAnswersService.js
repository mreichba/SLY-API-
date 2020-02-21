const UserAnswersService = {

  // Gets the user answer to a specific question
  getUserAnswer(db, question_id, user_id) {
    return db('user_answers')
      .select(
        'answers.answer',
        'answers.answered',
        'questions.answered AS question_answered'
      )
      .join(
        'answers',
        'answers.id',
        'user_answers.answer_id'
      )
      .join(
        'questions',
        'user_answers.question_id',
        'questions.id'
      )
      .where('user_answers.question_id', question_id)
      .andWhere('user_answers.user_id', user_id);
  },

  // Increases the questions answered value by 1
  increaseQuestionAnswered(db, question_id) {
    return db('questions')
      .where('id', question_id)
      .increment('answered', 1)
      .returning('answered');
  },

  increaseAnswerAnswered(db, answer_id) {
    return db('answers')
      .where('id', answer_id)
      .increment('answered', 1)
      .returning({
        answer: 'answer',
        answered: 'answered'
      });
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