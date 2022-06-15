DOMAIN := 64m.robinjungers.com

run-dev :
	NODE_ENV=development NODE_PORT=3001 npx vite

run-server :
	NODE_ENV=development NODE_PORT=3001 node server/index.js

run-prod-build :
	npx tsc
	NODE_ENV=production NODE_PORT=80 npx vite build
	
run-prod-server : 
	NODE_ENV=production NODE_PORT=80 node server/index.js

run-prod-ssl-build :
	npx tsc
	NODE_ENV=production NODE_PORT=443 npx vite build
	
run-prod-ssl-server :
	NODE_ENV=production NODE_PORT=443 node server/index.js

run-local-build :
	npx tsc
	NODE_ENV=production NODE_PORT=3000 npx vite build

run-local-server :
	NODE_ENV=production NODE_PORT=3000 node server/index.js

systemd-install :
	sudo ln -fs ./systemd/app.service /etc/systemd/system
	sudo systemctl enable app
	sudo systemctl start app

systemd-update :
	sudo systemctl daemon-reload
	sudo systemctl restart app

ssl-request :
	sudo certbot certonly -d $(DOMAIN)

ssl-install :
	ln -fs /etc/letsencrypt/live/$(DOMAIN)/fullchain.pem ./server/cert.pem
	ln -fs /etc/letsencrypt/live/$(DOMAIN)/privkey.pem ./server/key.pem
