import {
  BedrockCredentialsSchema,
  type RenamingConfig,
  type SettingsConfig,
  type UpdateSettingsInput,
} from "shared";

import { requireSDK } from "../../sdk";
import {
  clearBedrockCredentials,
  loadBedrockCredentials,
  saveBedrockCredentials,
} from "../credentials";
import { GlobalStore } from "../global-store";

import { createInitialModel, type SettingsMessage, type SettingsModel } from "./model";
import { update } from "./update";

class SettingsStore extends GlobalStore<SettingsModel, SettingsMessage> {
  private readonly basePath: string;

  constructor() {
    super("settings");
    this.basePath = requireSDK().meta.path();
  }

  protected createInitialModel(): SettingsModel {
    return createInitialModel();
  }

  protected update(model: SettingsModel, message: SettingsMessage): SettingsModel {
    return update(model, message);
  }

  protected override async persist(): Promise<void> {
    const { bedrockCredentials, ...rest } = this.getModel();
    await this.persistence.save(rest);
    if (bedrockCredentials !== undefined) {
      await saveBedrockCredentials(this.basePath, bedrockCredentials);
    } else {
      await clearBedrockCredentials(this.basePath);
    }
  }

  protected override async afterInitialize(loaded: unknown): Promise<void> {
    // Load credentials from encrypted storage
    const encryptedCreds = await loadBedrockCredentials(this.basePath);
    if (encryptedCreds !== undefined) {
      this.dispatch({ type: "UPDATE_SETTINGS", input: { bedrockCredentials: encryptedCreds } });
      return;
    }

    // Migration: if plaintext credentials exist in the old settings.json, move them to encrypted storage
    const loadedObj = loaded as Record<string, unknown> | undefined;
    if (loadedObj?.bedrockCredentials !== undefined) {
      const parsed = BedrockCredentialsSchema.safeParse(loadedObj.bedrockCredentials);
      if (parsed.success) {
        this.dispatch({ type: "UPDATE_SETTINGS", input: { bedrockCredentials: parsed.data } });
        await this.persist();
      }
    }
  }

  getSettings(): SettingsConfig {
    return this.getModel();
  }

  async updateSettings(input: UpdateSettingsInput): Promise<void> {
    this.dispatch({ type: "UPDATE_SETTINGS", input });
    await this.persist();
    this.notify();
  }

  async updateRenaming(input: Partial<RenamingConfig>): Promise<void> {
    this.dispatch({ type: "UPDATE_RENAMING", input });
    await this.persist();
    this.notify();
  }
}

let instance: SettingsStore | undefined;

export function getSettingsStore(): SettingsStore {
  if (instance === undefined) {
    instance = new SettingsStore();
  }
  return instance;
}
