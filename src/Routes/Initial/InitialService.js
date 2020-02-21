const InitialService = {
  insertAnswers(db, answers) {
    return db
      .into('users_info')
      .insert(answers)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  initialStatus(db, user_id) {
    return db
      .from('users_info')
      .where({ user_id })
      .first()
      .returning('*');
  }
};

module.exports = InitialService;
