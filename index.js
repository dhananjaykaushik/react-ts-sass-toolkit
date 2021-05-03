#!/usr/bin/env node
const { program } = require("@caporal/core");
const fs = require("fs");
const cmd = require("node-cmd");

const GIT_REPO = `https://github.com/dhananjaykaushik/react-ts-sass-skeleton.git`;
const REPO_FOLDER_NAME = `react-ts-sass-skeleton`;

const getPath = (name) => {
    return `${process.cwd()}/${name}`;
};

const namingRules = `
    - Folder should not exist.
    - First character cannot be underscore or number.
    - There should not be any white-space.
    - Only special character allowed in hyphen (-).
`;

const namingRulesForComponent = `
    - Component should not exist.
    - First character cannot be number.
    - There should not be any white-space.
    - No special character in name.
`;

const validateName = (name) => {
    if (Number(name[0]) || name[0] === "-") {
        return false;
    }
    //   Checking if path / folder exist
    if (fs.existsSync(getPath(name))) {
        return false;
    }

    const regexp = /^[a-zA-Z0-9-]*$/;
    return regexp.test(name);
};

const validateComponentName = (name) => {
    if (Number(name[0])) {
        return false;
    }
    //   Checking if path / folder exist
    if (fs.existsSync(getPath(name))) {
        return false;
    }

    const regexp = /^[a-zA-Z0-9]*$/;
    return regexp.test(name);
};

const pathHandling = (appName, logger) => {
    // logger.info(`Creating directory ${appName}`);
    fs.mkdirSync(getPath(appName));

    // Changing directory
    process.chdir(getPath(appName));
};

const cloneRepository = (appName, logger) => {
    pathHandling(appName, logger);
    logger.info(`Cloning repository`);
    cmd.runSync(`git clone ${GIT_REPO}`);
    logger.info(`Repository cloned`);

    // Moving all files to main folder
    const repoFolderPath = `${getPath("")}${REPO_FOLDER_NAME}`;
    cmd.runSync(`mv ${repoFolderPath}/.* mv ${repoFolderPath}/* ./`);

    // Deleting folder
    cmd.runSync(`rm -rf ${repoFolderPath}`);
};

const modifyPackageJson = (appName, logger, options) => {
    logger.info("Modifying package.json");
    const packageJsonFilePath = `${getPath("")}package.json`;
    const data = JSON.parse(fs.readFileSync(packageJsonFilePath, "utf8"));
    data.name = appName;
    data.author = options.author;
    fs.writeFileSync(packageJsonFilePath, JSON.stringify(data, null, "\t"));
};

const installDependencies = (appName, logger) => {
    logger.info("Installing dependencies ...");
    cmd.runSync("npm install");
    logger.info("All setup.. Happy Coding !!");
};

const makeComponentStructure = (componentName, logger) => {
    logger.info(`Creating component ${componentName}`);
    // Creating directory
    fs.mkdirSync(getPath(componentName));
    // Changing directory
    process.chdir(getPath(componentName));

    // Creating files
    logger.info(`Creating sass file`);
    fs.open(`${componentName}.sass`, "w+", (error, file) => {
        fs.writeFile(
            `${componentName}.sass`,
            "// Add your styles here",
            (error) => {
                if (!error) {
                    logger.info(`Sass file created successfully`);
                }
            }
        );
    });
    logger.info(`Creating tsx file`);
    fs.open(`${componentName}.tsx`, "w+", (error, file) => {
        fs.writeFile(
            `${componentName}.tsx`,
            `import './${componentName}.sass'

export const ${componentName} = () => {
    return (
        <>
            <p>${componentName} is here...</p>
        </>
    )
}            
            `,
            (error) => {
                if (!error) {
                    logger.info(`TSX file created successfully`);
                }
            }
        );
    });
};

// New Application Generation

const generateAppArguments = ["<app-name>", "Name of react application"];
const generateAppOptions = [
    "--author <word>",
    "Author of application",
    {
        default: "Curious React Developer",
    },
];
const generateApp = ({ logger, args, options }) => {
    if (args.appName && args.appName.length && validateName(args.appName)) {
        cloneRepository(args.appName, logger);
        modifyPackageJson(args.appName, logger, options);
        installDependencies(args.appName, logger);
    } else {
        logger.error(`
      Invalid App Name
      ${namingRules}
      `);
    }
};
program
    .command("create")
    .argument(...generateAppArguments)
    .option(...generateAppOptions)
    .action(generateApp);

program
    .command("new")
    .argument(...generateAppArguments)
    .option(...generateAppOptions)
    .action(generateApp);

// New component creation
const generateComponentArguments = [
    "<component-name>",
    "Name of react component",
];
const generateComponent = ({ logger, args }) => {
    if (
        args.componentName &&
        args.componentName.length &&
        validateComponentName(args.componentName)
    ) {
        makeComponentStructure(args.componentName, logger);
    } else {
        logger.error(`
      Invalid Component Name
      ${namingRulesForComponent}
      `);
    }
};

program
    .command("component")
    .argument(...generateComponentArguments)
    .action(generateComponent);

program
    .command("c")
    .argument(...generateComponentArguments)
    .action(generateComponent);

program.run();
