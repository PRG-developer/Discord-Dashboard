/**
 * @file Discord-Dashboard Source
 * @author Assistants Center
 * @license CC BY-NC-SA 4.0
 * @version 3.0.0
 */

import {Client, ProjectInfo, SessionSettings, SSLOptions, UserStatic} from "./types/types"

import {fastify as fastifyModule} from 'fastify'

import fastifySession from '@fastify/session'
import fastifyCookie from "@fastify/cookie"
import fastifyOauth2 from "@fastify/oauth2"

import * as ApiRouter from './api/router'

import path from 'path'
import fs from 'fs'

/**
 * Discord-Dashboard Class
 * @example
 * const DBD = require('discord-dashboard')
 *
 * const Dashboard = new DBD.Dashboard()
 *      .setPort(3000)
 *      .setDev(true)
 *      .start()
 */
export class Dashboard {
    /**
     * Constructor does not require any parameters.
     *
     * Perform all options to set in the Dashboard by adding functions to the class (before using the start method).
     */
    constructor() {
    }
    private fastify: any

    public port: number | undefined
    public dev: boolean = false
    private theme: any

    private project: ProjectInfo | undefined

    private sessionStore: any
    private sessionSecret: string | undefined
    private sessionExpires: number | undefined
    private saveUninitialized: boolean | undefined

    public administrators: string[] | undefined
    public fastifyUtilities: object | undefined

    public categories: any[] = [];

    private client: Client | undefined

    private discordClient: any

    public userStatic: UserStatic | undefined

    private SSL: SSLOptions | undefined

    /**
     * @methodOf Dashboard
     * Define if it's a development environment. If it's a development environment, it will use the nextjs dev server and won't send statistics to Assistants Services.
     * @param {boolean} dev - If true, the dashboard will be in development mode.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setDev(dev: boolean) {
        this.dev = dev
        return this
    }

    /**
     * Set the Discord client OAuth2 credentials to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setClientCredentials (clientData: Client) {
        this.client = clientData
        return this
    }

    /**
     * Register the project with the Assistants Services Discord Dashboard Project.
     * @param {string} [info.accountToken] - The account token to use.
     * @param {string} [info.projectId] - The project id to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public registerProject(projectInfo: ProjectInfo) {
        this.project = projectInfo
        return this
    }

    /**
     * @methodOf Dashboard
     * @description Set the theme to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setTheme(theme: any) {
        this.theme = theme
        return this
    }

    /**
     * @methodOf Dashboard
     * @description Set the port to use.
     * @param {number} port - The port to use for the dashboard.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setPort(port: number) {
        this.port = port
        return this
    }

    /**
     * Set the session config to use.
     *  @returns {Dashboard} - The Dashboard instance.
     */
    public setSession( sessionSettings: SessionSettings ) {
        sessionSettings = Object.assign({
            store: (fastifySession: any)=>fastifySession.memory,
            secret: '',
            expires: 3600,
            saveUninitialized: true,
        }, sessionSettings)

        this.sessionStore = sessionSettings.store(fastifySession)
        this.sessionSecret = sessionSettings.secret
        this.sessionExpires = sessionSettings.expires
        this.saveUninitialized = sessionSettings.saveUninitialized
        return this
    }

    /**
     * Set the static config to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setStatic(staticConfig: UserStatic) {
        staticConfig = Object.assign({
            url: '/static',
            path: './static',
        }, staticConfig)

        this.userStatic = staticConfig
        return this
    }

    /**
     * Set the Discord.js client to use.
     * @param client - The Discord.js client.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setDiscordClient (client: any) {
        this.discordClient = client
        return this
    }

    /**
     * Set SSL options.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setSSL (sslInfo: SSLOptions) {
        this.SSL = sslInfo
        return this
    }

    /**
     * Set the options folder to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setOptionsFolder (path_src: string) {
        const categories = fs.readdirSync(path_src)
        for(const category of categories) {

            let categoryId = category
            while(categoryId.includes(' '))
                categoryId = categoryId.replace(' ', '_')

            const categoryData = {
                id: categoryId.toLowerCase(),
                name: category,
            }

            const categoryOptions = this.resolveOptions(path.join(path_src, category))
            this.categories.push({
                id: categoryData.id,
                name: categoryData.name,
                options: categoryOptions
            })
        }
        return this
    }

    /**
     * Set the administrators to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setAdministrators (administrators: string[]) {
        this.administrators = administrators
        return this
    }

    /**
     * Set the fastify utilities to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setFastifyUtilities (fastifyUtilities: object) {
        this.fastifyUtilities = fastifyUtilities
        return this
    }

    /**
     * Start the dashboard.
     * @returns {Promise<Dashboard>} - The Dashboard instance.
     */
    public start = async () => {
        if(this.dev) {
            console.log('Dashboard is in development mode. Please note that the dashboard will not send statistics to Assistants Services.')
            console.log('Also, each change in the theme pages source code will not be reflected in the dashboard after turning off development mode. You\'ll have to run the build command inside theme folder to build the changes into production environment.')
        }
        this.fastify = fastifyModule({ logger: this.dev })
        const nextPrepared = await this.prepareNext()
        this.registerFastifyNext()
        this.registerFastifySession(this.fastify)
        // @ts-ignore
        for(const util of this.fastifyUtilities) {
            this.fastify.register(util[0], util[1]||{})
        }
        const FastifyApp = await this.prepareFastify(nextPrepared)

        await FastifyApp.listen({
            port: this.port,
        })
        return this
    }


    /**
     * Resolve the options to use.
     * @param {String} optionsPath - The path to the options folder.
     */
    private resolveOptions (optionsPath: string) {
        const files = fs.readdirSync(optionsPath).filter(file => !file.endsWith('.disabled.js') && file.endsWith('.js'))
        const options = []
        for(const Option of files) {
            const option = require(path.join(optionsPath, `./${Option}`))
            options.push(option)
        }
        return options
    }

    /**
     * Prepare the next app.
     * @returns {Promise<{next_handler: RequestHandler, next_app: NextServer}>}
     */
    private prepareNext = async () => {
        const { next_app, next_handler } = this.theme.initNext(this.dev)
        await next_app.prepare()
        return { next_app, next_handler }
    }

    /**
     * Register the next app inside fastify.
     */
    private registerFastifyNext () {
        // @ts-ignore
        this.theme.registerFastifyNext(this.fastify, this.dev)
        return
    }

    /**
     * Register the fastify session plugin with fastify cookies.
     * @param fastify - The fastify instance.
     */
    private registerFastifySession (fastify: any) {
        fastify.register(fastifyCookie)
        fastify.register(fastifySession, {
            // @ts-ignore
            secret: this.sessionSecret || `${this.discordClient.id}+${this.client.id}`,
            cookie: { secure: Boolean(this.SSL?.httpRedirect) },
            expires: this.sessionExpires || 1000*60*60*24*7, // 7 days
            saveUninitialized: this.saveUninitialized,
            store: this.sessionStore,
        })
    }

    /**
     * Register the fastify static (for module, theme, and user).
     */
    private registerFastifyStatic () {
        this.fastify.register(require('@fastify/static'), {
            root: path.join(__dirname, 'public'),
            prefix: '/module-content/',
        })

        this.fastify.register(require('@fastify/static'), {
            root: this.theme.public_path,
            prefix: '/theme-content/',
            decorateReply: false
        })

        if(this.userStatic) {
            this.fastify.register(require('@fastify/static'), {
                root: this.userStatic.path,
                prefix: this.userStatic.url+'/',
                decorateReply: false
            })
        }
    }

    /**
     * Register the fastify oauth2 plugin with the Discord client OAuth2 credentials.
     */
    private registerFastifyOAuth2 () {
        this.fastify.register(fastifyOauth2, {
            name: 'discordOAuth2',
            scope: ["identify", "guilds", "guilds.join"],
            credentials: {
                client: {
                    // @ts-ignore
                    id: this.client.id,
                    // @ts-ignore
                    secret: this.client.secret
                },
                auth: fastifyOauth2.DISCORD_CONFIGURATION
            },
            startRedirectPath: '/auth',
            callbackUri: 'http://localhost:3000/api/auth/callback',
        })
    }

    /**
     * Init Discord Dashboard API.
     */
    private initFastifyApi () {
        ApiRouter.router({ fastify: this.fastify, client: this.discordClient });
    }

    /**
     * Init theme pages.
     * @returns {Promise<void>}
     */
    private initFastifyThemePages = async () => {
        const ThemePages = await this.theme.getPages({ fastify: this.fastify, client: this.discordClient })
        for (const page of ThemePages) {
            this.fastify.route({
                method: page.method.toUpperCase(),
                url: page.url,
                preHandler: async (request: any, reply: any) => await page.preHandler(request, reply),
                handler: async (request: any, reply: any) => await page.handler(request, reply),
            })
        }
    }

    /**
     * Prepare the fastify app.
     * @returns {Promise<FastifyInstance<http.Server, RawRequestDefaultExpression<http.Server>, RawReplyDefaultExpression<http.Server>, boolean> | PromiseLike<FastifyInstance<http.Server, RawRequestDefaultExpression<http.Server>, RawReplyDefaultExpression<http.Server>, boolean>> | FastifyInstance<https.Server, RawRequestDefaultExpression<https.Server>, RawReplyDefaultExpression<https.Server>, boolean> | PromiseLike<FastifyInstance<https.Server, RawRequestDefaultExpression<https.Server>, RawReplyDefaultExpression<https.Server>, boolean>> | FastifyInstance<http2.Http2Server, RawRequestDefaultExpression<http2.Http2Server>, RawReplyDefaultExpression<http2.Http2Server>, boolean> | PromiseLike<FastifyInstance<http2.Http2Server, RawRequestDefaultExpression<http2.Http2Server>, RawReplyDefaultExpression<http2.Http2Server>, boolean>> | FastifyInstance<http2.Http2SecureServer, RawRequestDefaultExpression<http2.Http2SecureServer>, RawReplyDefaultExpression<http2.Http2SecureServer>, boolean> | PromiseLike<FastifyInstance<http2.Http2SecureServer, RawRequestDefaultExpression<http2.Http2SecureServer>, RawReplyDefaultExpression<http2.Http2SecureServer>, boolean>>>}
     * @param settings
     */
    private prepareFastify = async (settings: { next_app: any, next_handler: any }) => {
        const fastify = this.fastify

        this.registerFastifyStatic()
        this.registerFastifyOAuth2()
        this.initFastifyApi()
        await this.initFastifyThemePages()

        return fastify
    }
}

/**
 * Discord-Dashboard option file structure.
 *
 * @example
 * const DBD = require('discord-dashboard')
 * module.exports = {
 *     id: 'prefix',
 *     name: 'Prefix',
 *     description: 'Change bot prefix easily',
 *     type: DBD.FormTypes.TextInput('a'),
 * }
 *
 * @property {string} id - The id of the option.
 * @property {string} name - The name of the option.
 * @property {string} description - The description of the option.
 * @property {any} type - The type of the option.
 * @property {any} default - The default value of the option.
 * @property {boolean} [disabled=false] - Whether the option is disabled.
 * @property {function} set - The function to set the option value.
 * @property {function} get - The function to get the option value.
 * @namespace Option Structure
 */

import { TextInput } from './formtypes/TextInput'

export const FormTypes = {
    TextInput,
}