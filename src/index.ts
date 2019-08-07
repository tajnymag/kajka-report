import 'reflect-metadata';

import app from './app';

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log('Server has started listening on port ' + port);
});
