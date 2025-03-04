FROM node:23.6.0

# Указываем корневую папку приложения
ENV APP_ROOT /web

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR ${APP_ROOT}

# Копируем только package.json и package-lock.json для кеширования зависимостей
COPY frontend/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь код проекта
COPY frontend/. .

# Собираем проект
RUN npm run build

