# O Clube Discord Bot

A bot for our Discord server, full of features and bugs.


# Init database

To initialize the database you should run the following:
```bash
npx sequelize-cli db:migrate
```

To update the database models:
```bash
sequelize-mig migration:make -n <migration_name>
```


# TODO
* Review usage of `sequelize-mig`
