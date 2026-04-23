-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "auth"."users"(lower("name"));
