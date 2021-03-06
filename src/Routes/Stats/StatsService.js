const StatsService = {
  // returns how many times the users answer matched another user for that particular question
  checkUserAnswerOccurances(db, question_id, answer_id) {
    return db('user_answers')
      .where({ question_id })
      .andWhere({ answer_id });
  },

  // returns with a count of how many potential answers for the question
  answerOptions(db, question_id) {
    return db('answers')
      .pluck('id')
      .where({ question_id });
  },

  // returns how many people have answered a particular question
  totalAnswers(db, question_id) {
    return db('user_answers')
      .pluck('answer_id')
      .where({ question_id });
  },

  // Gets the users initial quiz answer data
  getUserData(db, user_id) {
    return db('users_info')
      .select('*')
      .where({ user_id });
  },

  // Gets all the users initial quiz answer data
  getAllUserData(db) {
    return db('users_info').select('*');
  }
};

module.exports = StatsService;
