import { Snowflake, TextChannel, ThreadChannel } from "discord.js";
import * as t from "io-ts";
import { erisAllowedMentionsToDjsMentionOptions } from "src/utils/erisAllowedMentionsToDjsMentionOptions";
import { LogType } from "../../../data/LogType";
import {
  createTypedTemplateSafeValueContainer,
  renderTemplate,
  TemplateParseError,
  TemplateSafeValueContainer,
} from "../../../templateFormatter";
import {
  createChunkedMessage,
  messageLink,
  stripObjectToScalars,
  tAllowedMentions,
  tNormalizedNullOptional,
  isTruthy,
  verboseChannelMention,
  validateAndParseMessageContent,
} from "../../../utils";
import { LogsPlugin } from "../../Logs/LogsPlugin";
import { automodAction } from "../helpers";
import {
  savedMessageToTemplateSafeSavedMessage,
  TemplateSafeUser,
  userToTemplateSafeUser,
} from "../../../utils/templateSafeObjects";
import { messageIsEmpty } from "../../../utils/messageIsEmpty";

export const AlertAction = automodAction({
@@ -69,6 +73,7 @@ export const AlertAction = automodAction({
            matchSummary: matchResult.summary,
            messageLink: theMessageLink,
            logMessage: validateAndParseMessageContent(logMessage)?.content,
            message: contexts[0].message ? savedMessageToTemplateSafeSavedMessage(contexts[0].message) : undefined,
          }),
        );
      } catch (err) {
        if (err instanceof TemplateParseError) {
          pluginData.getPlugin(LogsPlugin).logBotAlert({
            body: `Error in alert format of automod rule ${ruleName}: ${err.message}`,
          });
          return;
        }
        throw err;
      }
      if (messageIsEmpty(rendered)) {
        pluginData.getPlugin(LogsPlugin).logBotAlert({
          body: `Tried to send alert with an empty message for automod rule ${ruleName}`,
        });
        return;
      }
      try {
        await createChunkedMessage(
          channel,
