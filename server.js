const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './password.proto';

const loaderOptions = {
    keepCase: true, // Instructs the protoLoader to maintain protobuf field names
    longs: String, // longs and enums store the data types that represent long and enum values
    enums: String, // defaults, when set to true, sets default values for output objects
    defaults: true, // oneof sets virtual oneof properties to field names
    oneofs: true,
}

// Initializing the package definition
var packageDef = protoLoader.loadSync(PROTO_PATH, loaderOptions);

const grpcObj = grpc.loadPackageDefinition(packageDef);

const ourServer = new grpc.Server();

let dummyRecords = {
    "passwords": [
        { id: "153642", password: "default1", hashValue: "default", saltValue:       "default" },
        { id: "234654", password: "default2", hashValue: "default", saltValue: "default" }]
};

ourServer.addService(grpcObj.PasswordService.service, {
    /*our protobuf message(passwordMessage) for the RetrievePasswords was Empty. */
    retrievePasswords: (passwordMessage, callback) => {
        callback(null, dummyRecords);
    },
    addNewDetails: (passwordMessage, callback) => {
        const passwordDetails = { ...passwordMessage.request };
        dummyRecords.passwords.push(passwordDetails);
        callback(null, passwordDetails);
    },
    updatePasswordDetails: (passwordMessage, callback) => {
        const detailsID = passwordMessage.request.id;
        const targetDetails = dummyRecords.passwords.find(({ id }) => detailsID == id);
        targetDetails.password = passwordMessage.request.password;
        targetDetails.hashValue = passwordMessage.request.hashValue;
        targetDetails.saltValue = passwordMessage.request.saltValue;
        callback(null, targetDetails);
    },
});

ourServer.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        console.log("Server running at http://127.0.0.1:50051");
        ourServer.start();
    }
);