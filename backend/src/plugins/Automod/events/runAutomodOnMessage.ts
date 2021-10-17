import { Snowflake } from "discord.js";
import { GuildPluginData } from "knub";
import moment from "moment-timezone";
import { SavedMessage } from "../../../data/entities/SavedMessage";
import { addRecentActionsFromMessage } from "../functions/addRecentActionsFromMessage";
import { clearRecentActionsForMessage } from "../functions/clearRecentActionsForMessage";
import { runAutomod } from "../functions/runAutomod";
import { AutomodContext, AutomodPluginType } from "../types";
import { performance } from "perf_hooks";

export async function runAutomodOnMessage(
  pluginData: GuildPluginData<AutomodPluginType>,
  message: SavedMessage,
  isEdit: boolean,
) {
  const member = await pluginData.guild.members.fetch(message.user_id).catch(() => undefined);
  const user = await pluginData.client.users.fetch(message.user_id).catch(() => undefined);

  const context: AutomodContext = {
    timestamp: moment.utc(message.posted_at).valueOf(),
    message,
    user,
    member,
  };

  pluginData.state.queue.add(async () => {
    const startTime = performance.now();

    if (isEdit) {
      clearRecentActionsForMessage(pluginData, context);
    }

    addRecentActionsFromMessage(pluginData, context);

    await runAutomod(pluginData, context);

    pluginData.getKnubInstance().profiler.addDataPoint(`automod:${pluginData.guild.id}`, performance.now() - startTime);
  });
}
