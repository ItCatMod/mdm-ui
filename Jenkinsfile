pipeline {
  agent any

  options {
    timestamps()
    skipStagesAfterUnstable()
    buildDiscarder(logRotator(numToKeepStr: '30'))
  }

  /*
  nvm wrapper has to wrap all steps, interestingly its not supposed to work with the .nvmrc file however if you exclude the version as a blank string
  then it passes the blank string as the version and therefore nvm just does its job and uses the .nvmrc file.
  */
  stages {

    stage('Tool Versions') {
      steps {
        nvm('') {
          sh 'node --version'
          sh 'npm --version'
        }
      }
    }

    stage('Install') {
      steps {
        nvm('') {
          sh 'npm install -g npm-check'
          sh 'npm install -g @angular/cli'
          sh 'npm ci'
        }
      }
    }

    stage('Build & Test') {
      steps {
        nvm('') {
          sh 'ng lint'
          sh 'ng test --coverage'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test_results/*.xml'
        }
      }
    }

    //    stage('Archive Build') {
    //      when {
    //        allOf {
    //          branch 'master'
    //          expression {
    //            currentBuild.currentResult == 'SUCCESS'
    //          }
    //        }
    //
    //      }
    //      steps {
    //        archiveArtifacts artifacts: '**/build/**/*.tgz'
    //      }
    //    }
  }

  post {
    always {
      slackNotification()
    }
  }
}
