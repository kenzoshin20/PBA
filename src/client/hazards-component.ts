import { BaseComponent } from "./base-component.js";

type Props = {
    spikes: number
    toxic_spikes: number
    rocks: boolean
    web: boolean
    reflect: boolean
    light_screen: boolean
}

export class EnemyHazardsComponent extends BaseComponent<{}> {
    template = /*html*/`
        <div class="absolute">

            <div class="relative top-10">
                <div $class="{invisible: !props.light_screen}" class="h-20 w-20 z-35 relative" 
                    style="background-color: #90a2de; opacity: 0.5; top: 85px; left: 14px">
                </div>
                <div $class="{invisible: !props.reflect}" class="h-20 w-20 z-35 absolute" 
                    style="background-color: #cf8686; opacity: 0.5; top: 70; left: 10px">
                </div>
            </div>
            
            <div $class="{invisible: !props.rocks}" class="flex flex-row justify-end mr-12 relative top-7">
                <img class="z-20 h-2 mr-7" src="/img/rock1.png">
                <img class="h-4 mr-4" src="/img/rock2.png">
                <img class="h-2 mr-1 " src="/img/rock1.png">
                <img class="h-4 mr-3 " src="/img/rock1.png">
                <img class="z-20 h-2 " src="/img/rock2.png">
            </div>

            <div class="flex flex-row justify-end relative top-14">
                <div class="w-32 z-10">
                    <div class="flex flex-row justify-items-start">
                    <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 relative ml-6 top-1 darker-2" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-14">
                <div class="w-32 z-10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative darker-1" src="/img/spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-14">
                <div class="w-32 z-10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative bottom-2 darker-1" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>

            <div $class="{invisible: !props.web}" class="flex flex-row justify-end mr-12 relative top-3">
                <img class="h-12 w-28 mr-1" src="/img/web.png">
            </div>
        
        </div>
    `
}

export class UserHazardsComponent extends BaseComponent<{}> {
    template = /*html*/`
        <div class="absolute">

            <div class="relative top-10">
                <div $class="{invisible: !props.light_screen}" class="h-24 w-24 relative" 
                    style="z-index: -10; background-color: #90a2de; opacity: 0.5; top: 35px; left: 55px">
                </div>
                <div $class="{invisible: !props.reflect}" class="h-24 w-24 absolute" 
                    style="z-index: -11; background-color: #cf8686; opacity: 0.5; top: 25px; left: 59px">
                </div>
            </div>
            
            <div $class="{invisible: !props.rocks}" class="flex flex-row justify-end mr-12 relative left-7">
                <img class="z-20 h-3 mr-7" src="/img/rock1.png">
                <img class="h-5 mr-4" src="/img/rock2.png">
                <img class="h-3 mr-1 " src="/img/rock1.png">
                <img class="h-5 mr-3 " src="/img/rock1.png">
                <img class="z-20 h-3 " src="/img/rock2.png">
            </div>

            <div class="flex flex-row justify-end relative top-10">
                <div class="w-32 z--10">
                    <div class="flex flex-row justify-items-start">
                    <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 relative ml-6 top-1 darker-2" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-10">
                <div class="w-32 z--10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative darker-1" src="/img/spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-10">
                <div class="w-32 z--10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative bottom-2 darker-1" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>

            <div $class="{invisible: !props.web}" class="flex flex-row justify-end mr-12 relative bottom-2 left-8">
                <img class="h-12 w-28 mr-1" src="/img/web.png">
            </div>

        </div>
    `
}