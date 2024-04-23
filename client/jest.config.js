module.exports = {
    moduleNameMapper: {
      "\\.(css|sass)$": "identity-obj-proxy",
    },
    testEnvironment: 'jsdom', // Set the test environment to jsdom
    transform: {
      '^.+\\.jsx?$': 'babel-jest', // Use babel-jest for JSX transpilation
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$', // Regex pattern to find test files
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'], // File extensions Jest should look for
  };
