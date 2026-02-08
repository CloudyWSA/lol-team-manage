"use client"

import React from "react"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Swords,
  Shield,
  Zap,
  Coins,
  Ghost,
  Bug,
  Target,
  BarChart3,
} from "lucide-react"
import { 
  getChampionIcon, 
  getItemIcon, 
  getRuneIcon,
  getChampionSplash 
} from "@/lib/riot-assets"

export function MatchTeamOverview({ teams, version }: { teams: any, version: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <MatchTeamRoster team={teams.blue} isBlue={true} version={version} />
      <MatchTeamRoster team={teams.red} isBlue={false} version={version} />
    </div>
  )
}

export function MatchTeamRoster({ team, isBlue, version }: { team: any, isBlue: boolean, version: string }) {
  return (
    <Card className={`stat-card border-border/50 overflow-hidden ${isBlue ? "border-l-4 border-l-blue-500" : "border-r-4 border-r-red-500"}`}>
      <CardHeader className={`flex flex-row items-center justify-between py-4 ${isBlue ? "bg-blue-500/5" : "bg-red-500/5"}`}>
        <div>
          <CardTitle className="text-xl font-black italic uppercase tracking-tight">{team.name}</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
            {isBlue ? "Lado Azul" : "Lado Vermelho"} • {team.won ? "Vitoria" : "Derrota"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Gold</p>
            <p className="text-lg font-bold">{team.stats ? (team.stats.gold / 1000).toFixed(1) : "0.0"}k</p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${team.won ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
            {team.stats?.kills || 0}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-around py-3 bg-muted/20 border-y border-border/50">
          <MatchObjectiveStat label="Torres" value={team.stats?.towers || 0} icon={Shield} />
          <MatchObjectiveStat label="Dragoes" value={team.stats?.dragons || 0} icon={Ghost} />
          <MatchObjectiveStat label="Barons" value={team.stats?.barons || 0} icon={Zap} />
          <MatchObjectiveStat label="Grubs" value={team.stats?.grubs || 0} icon={Bug} />
        </div>
        <div className="divide-y divide-border/50">
          {team.players.map((player: any, idx: number) => (
            <MatchPlayerRow key={idx} player={player} isBlue={isBlue} version={version} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function MatchPlayerRow({ player, isBlue, version }: { player: any, isBlue: boolean, version: string }) {
  if (!player) return null;

  const items = player.items || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between p-2.5 hover:bg-primary/5 cursor-pointer transition-colors group">
          <div className="flex items-center gap-3">
            {/* Runes Column */}
            <div className="flex flex-col gap-0.5 justify-center">
              {player.runes && (
                <>
                  <div className="relative h-6 w-6 rounded-full bg-black/40 border border-white/5 p-0.5">
                    {getRuneIcon(player.runes.keystone) && <Image src={getRuneIcon(player.runes.keystone)} alt="keystone" fill className="object-contain" />}
                  </div>
                  <div className="relative h-4 w-4 rounded-full bg-black/40 border border-white/5 p-0.5 ml-1">
                    {getRuneIcon(player.runes.style) && <Image src={getRuneIcon(player.runes.style)} alt="style" fill className="object-contain opacity-80" />}
                  </div>
                </>
              )}
            </div>

            {/* Champ Icon */}
            <div className={`relative h-11 w-11 overflow-hidden rounded-xl bg-muted border-2 ${isBlue ? "border-blue-500/30" : "border-red-500/30"}`}>
              {getChampionIcon(player.champion, version) && (
                <Image 
                  src={getChampionIcon(player.champion, version)} 
                  alt={player.champion || "Champion"} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-110"
                  sizes="44px"
                />
              )}
            </div>

            {/* Name/Role */}
            <div className="w-24">
              <p className="text-xs font-black leading-tight mb-0.5 truncate">{player.name}</p>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{player.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* High Level Stats */}
            <div className="hidden lg:flex items-center gap-6 px-4">
              <div className="text-right">
                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase leading-none mb-1">Dano</p>
                <p className="text-xs font-mono font-bold">{( (player.dmg || 0) / 1000).toFixed(1)}k</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase leading-none mb-1">Visão</p>
                <p className="text-xs font-mono font-bold">{player.vision || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase leading-none mb-1">Ouro</p>
                <p className="text-xs font-mono font-bold">{( (player.gold || 0) / 1000).toFixed(1)}k</p>
              </div>
            </div>

            {/* KDA & CS */}
            <div className="hidden sm:flex flex-col items-end min-w-[60px]">
              <p className="text-xs font-black tracking-tight">{player.kda || "0/0/0"}</p>
              <p className="text-[9px] text-muted-foreground font-bold">{player.cs || 0} CS</p>
            </div>

            {/* Items Build */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const item = items[i];
                  const itemIcon = item ? getItemIcon(item.id || item, version) : null;
                  return (
                    <div key={i} className="relative h-7 w-7 rounded-md bg-muted/40 border border-white/5 overflow-hidden shadow-inner">
                      {itemIcon && (
                        <Image 
                          src={itemIcon} 
                          alt="item" 
                          fill 
                          className="object-cover"
                          sizes="28px"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Trinket Separator */}
              <div className="w-px h-5 bg-border/40 mx-0.5" />
              <div className="relative h-7 w-7 rounded-md bg-muted/40 border border-white/5 overflow-hidden ring-1 ring-primary/20">
                {player.trinket && getItemIcon(player.trinket.id || player.trinket, version) && (
                  <Image 
                    src={getItemIcon(player.trinket.id || player.trinket, version) as string} 
                    alt="trinket" 
                    fill 
                    className="object-cover"
                    sizes="28px"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <MatchPlayerDeepDive player={player} isBlue={isBlue} version={version} />
    </Dialog>
  )
}

export function MatchPlayerDeepDive({ player, isBlue, version }: { player: any, isBlue: boolean, version: string }) {
  if (!player) return null;
  const items = player.items || [];

  return (
    <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl invokers-glow">
      <DialogHeader className="sr-only">
        <DialogTitle>Detalhes de {player.name || "Jogador"}</DialogTitle>
        <DialogDescription>Performance detalhada do jogador na partida</DialogDescription>
      </DialogHeader>
      <div className="relative h-32 w-full overflow-hidden">
        {getChampionSplash(player.champion) && (
          <Image 
            src={getChampionSplash(player.champion)} 
            alt={player.champion || "Champion"} 
            fill 
            className="object-cover object-top opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-end gap-6">
          <div className={`relative h-20 w-20 rounded-2xl overflow-hidden border-4 ${isBlue ? "border-blue-500" : "border-red-500"} shadow-2xl`}>
            {getChampionIcon(player.champion, version) && (
              <Image 
                src={getChampionIcon(player.champion, version)} 
                alt={player.champion || "Champion"} 
                fill 
                className="object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">{player.name || "Desconhecido"}</h2>
            <div className="flex items-center gap-2">
              <p className="font-bold text-primary uppercase text-xs tracking-widest">{player.champion || "Campeão"} • {player.role || "Role"}</p>
              {player.runes && (
                <div className="flex items-center gap-1.5 ml-2 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                  <div className="relative h-4 w-4">
                    <Image src={getRuneIcon(player.runes.keystone)} alt="keystone" fill className="object-contain" />
                  </div>
                  <div className="relative h-3 w-3">
                    <Image src={getRuneIcon(player.runes.style)} alt="style" fill className="object-contain opacity-70" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 grid gap-6 md:grid-cols-2">
        <MatchStatsSection 
          title="Combate" 
          icon={Swords} 
          color="text-red-500"
          stats={[
            { label: "Dano Causado", value: (player.dmg || 0).toLocaleString() },
            { label: "Kill Participation", value: player.kp || "0%" },
            { label: "Dano por Minuto", value: Math.floor((player.dmg || 0) / (player.duration || 30)).toLocaleString() },
          ]}
        />
        <MatchStatsSection 
          title="Economia" 
          icon={Coins} 
          color="text-yellow-500"
          stats={[
            { label: "Ouro Total", value: (player.gold || 0).toLocaleString() },
            { label: "CS Total", value: player.cs || 0 },
            { label: "CS por Minuto", value: ((player.cs || 0) / (player.duration || 30)).toFixed(1) },
          ]}
        />
        <MatchStatsSection 
          title="Visão" 
          icon={Target} 
          color="text-blue-500"
          stats={[
            { label: "Vision Score", value: player.vision || 0 },
            { label: "Wards Colocadas", value: Math.floor((player.vision || 0) * 0.6) },
            { label: "Wards Destruidas", value: Math.floor((player.vision || 0) * 0.2) },
          ]}
        />
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <h4 className="text-[10px] font-black tracking-widest uppercase">Build Final</h4>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const item = items[i];
              const itemIcon = item ? getItemIcon(item.id || item, version) : null;
              return (
                <div key={i} className="relative h-10 w-10 rounded-lg bg-muted border border-white/5 overflow-hidden group/item">
                  {itemIcon && (
                    <Image 
                      src={itemIcon} 
                      alt="item" 
                      fill 
                      className="object-cover"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

export function MatchObjectiveStat({ label, value, icon: Icon }: { label: string, value: number, icon: any }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/20 border border-border/30">
      <Icon className="h-3 w-3 text-muted-foreground mb-1" />
      <span className="text-[10px] font-black">{value}</span>
      <span className="text-[8px] text-muted-foreground font-bold tracking-tighter">{label}</span>
    </div>
  )
}

export function MatchStatsSection({ title, icon: Icon, color, stats }: { title: string, icon: any, color: string, stats: any[] }) {
  return (
    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-4 w-4 ${color}`} />
        <h4 className="text-[10px] font-black tracking-widest uppercase">{title}</h4>
      </div>
      <div className="space-y-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
            <span className="text-sm font-bold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
