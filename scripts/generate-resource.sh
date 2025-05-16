#!/bin/bash


#ex) module:r "user" "users"  (단수형: user, 복수형: users)



function nest-full-resource() {
  local name=$1                      # 단수형: user
  local plural=$2                    # 복수형: users
  local base="src/$plural"

  # 모듈 생성
  nest g module $plural

  # 기본 디렉토리 구조 생성
  mkdir -p $base/controllers \
           $base/services \
           $base/repositories \
           $base/dto \
           $base/entities

  # 컨트롤러와 서비스 생성
  nest g controller $plural/controllers/$plural --flat
  nest g service $plural/services/$plural --flat

  # 추가 파일 생성
  touch $base/repositories/$plural.repository.ts
  touch $base/enums
  touch $base/dto/$name.dto.ts
  touch $base/dto/create-$name.dto.ts
  touch $base/dto/update-$name.dto.ts
  touch $base/dto/delete-$name.dto.ts
  touch $base/dto/filter-$name.dto.ts
  touch $base/entities/$name.entity.ts

}

# 스크립트 실행
nest-full-resource "$1" "$2" 