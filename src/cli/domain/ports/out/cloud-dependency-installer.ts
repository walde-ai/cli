export interface InstallCloudDependenciesInput {
  cloudApisDirectory: string;
}

export interface ICloudDependencyInstaller {
  install(input: InstallCloudDependenciesInput): Promise<void>;
}
