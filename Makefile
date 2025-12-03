BACK_DIR=backend/cmd/api
FRONT_DIR=mediafacade-frontend

.PHONY: start_back start_front start git_end_work

start_back:
	cd $(BACK_DIR) && go run .

start_front:
	cd $(FRONT_DIR) && npm run dev

start:
	make -j 2 start_back start_front

end:
	git add .
	git commit -m "end_work commit"
	git push
