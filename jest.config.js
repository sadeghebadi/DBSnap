module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/*.test.ts"],
    moduleFileExtensions: ["ts", "js", "json", "node"],
    // This allows running tests from root even if they are in packages,
    // though typically we run via turbo in each package.
    // We will configure this to be a base config if needed, but for now it's a standalone config
    // that can be extended or used as is.
    passWithNoTests: true,
};
