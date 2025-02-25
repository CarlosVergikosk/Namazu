Autofarm = {
  settings: {
    autostart: false,
    method: 300,
    timebetween: 1,
    skipWhenFull: true,
    lowresfirst: true,
    stoplootbelow: true,
  },
  title: 'Autofarm settings',
  town: null,
  isPaused: false,
  iTown: null,
  interval: null,
  isCaptain: false,
  hasP: true,
  shouldFarm: [],
  checkReady: function (tristun) {
    var becklynn = ITowns.towns[tristun.id];
    if (becklynn.hasConqueror()) {
      return false;
    }
    if (!Autofarm.checkEnabled()) {
      return false;
    }
    if (tristun.modules.Autofarm.isReadyTime >= Timestamp.now()) {
      return tristun.modules.Autofarm.isReadyTime;
    }
    var darik = becklynn.resources();
    if (
      darik.wood == darik.storage &&
      darik.stone == darik.storage &&
      darik.iron == darik.storage &&
      Autofarm.settings.skipWhenFull
    ) {
      return false;
    }
    var aaliyahrose = false;
    $.each(ModuleManager.Queue.queue, function (index, demitria) {
      if (demitria.module == 'Autofarm') {
        var embla = tristun.relatedTowns.indexOf(demitria.townId);
        if (embla != -1) {
          aaliyahrose = true;
          return false;
        }
      }
    });
    if (Autofarm.settings.lowresfirst) {
      if (tristun.relatedTowns.length > 0) {
        aaliyahrose = false;
        $.each(tristun.relatedTowns, function (index, elaynah) {
          var akiela = becklynn.resources();
          var demarque = ITowns.towns[elaynah].resources();
          if (
            akiela.wood + akiela.stone + akiela.iron >
            demarque.wood + demarque.stone + demarque.iron
          ) {
            aaliyahrose = true;
            return false;
          }
        });
      }
    }
    if (aaliyahrose) {
      return false;
    }
    return true;
  },
  disableP: function () {
    Autoattack.settings = {
      autostart: false,
      method: 300,
      timebetween: 1,
      skipWhenFull: true,
      lowresfirst: true,
      stoplootbelow: true,
    };
  },
  checkEnabled: function () {
    return ModuleManager.modules.Autofarm.isOn;
  },
  startFarming: function (yo) {
    if (!Autofarm.checkEnabled()) {
      return false;
    }
    Autofarm.town = yo;
    Autofarm.shouldFarm = [];
    Autofarm.iTown = ITowns.towns[Autofarm.town.id];
    var zikora = function () {
      Autofarm.interval = setTimeout(function () {
        ConsoleLog.Log(Autofarm.town.name + ' getting farm information.', 1);
        if (!Autofarm.isCaptain) {
          Autofarm.initFarmTowns(function () {
            if (!Autofarm.checkEnabled()) {
              return false;
            }
            Autofarm.town.currentFarmCount = 0;
            Autofarm.claimResources();
          });
        } else {
          Autofarm.initFarmTownsCaptain(function () {
            if (!Autofarm.checkEnabled()) {
              return false;
            }
            Autofarm.claimResources();
          });
        }
      }, Autobot.randomize(1e3, 2e3));
    };
    if (ModuleManager.currentTown != Autofarm.town.key) {
      Autofarm.interval = setTimeout(function () {
        ConsoleLog.Log(Autofarm.town.name + ' move to town.', 1);
        if (!Autofarm.checkEnabled()) {
          return false;
        }
        ModuleManager.currentTown = Autofarm.town.key;
        Autofarm.town.isSwitched = true;
      }, Autobot.randomize(1e3, 2e3));
    }
    zikora();
  },
  initFarmTowns: function (cb) {
    DataExchanger.game_data(Autofarm.town.id, function (data) {
      if (!Autofarm.checkEnabled()) {
        return false;
      }
      $.each(data.map.data.data.data, function (index, island) {
        var villages = [];
        $.each(island.towns, function (index, village) {
          if (
            village.x == Autofarm.iTown.getIslandCoordinateX() &&
            village.y == Autofarm.iTown.getIslandCoordinateY() &&
            village.relation_status == 1
          ) {
            villages.push(village);
          }
        });
        Autofarm.town.farmTowns = villages;
      });
      $.each(Autofarm.town.farmTowns, function (index, village) {
        var readyToFarm = village.loot - Timestamp.now();
        if (readyToFarm <= 0) {
          Autofarm.shouldFarm.push(village);
        }
      });
      cb(true);
    });
  },
  initFarmTownsCaptain: function (yeiden) {
    DataExchanger.farm_town_overviews(Autofarm.town.id, function (aukeem) {
      if (!Autofarm.checkEnabled()) {
        return false;
      }
      var sumanth = [];
      $.each(aukeem.farm_town_list, function (jessalynne, mudasir) {
        if (
          mudasir.island_x == Autofarm.iTown.getIslandCoordinateX() &&
          mudasir.island_y == Autofarm.iTown.getIslandCoordinateY() &&
          mudasir.rel == 1
        ) {
          sumanth.push(mudasir);
        }
      });
      Autofarm.town.farmTowns = sumanth;
      $.each(Autofarm.town.farmTowns, function (elysabeth, margeurite) {
        var donterious = margeurite.loot - Timestamp.now();
        if (donterious <= 0) {
          Autofarm.shouldFarm.push(margeurite);
        }
      });
      yeiden(true);
    });
  },
  claimResources: function () {
    if (!Autofarm.town.farmTowns[0]) {
      ConsoleLog.Log(Autofarm.town.name + ' has no farm towns.', 1);
      Autofarm.finished(1800);
      return false;
    }
    if (Autofarm.town.currentFarmCount < Autofarm.shouldFarm.length) {
      Autofarm.interval = setTimeout(function () {
        var type = 'normal';
        if (!Game.features.battlepoint_villages) {
          if (
            Autofarm.shouldFarm[Autofarm.town.currentFarmCount].mood >= 86 &&
            Autofarm.settings.stoplootbelow
          ) {
            type = 'double';
          }
          if (!Autofarm.settings.stoplootbelow) {
            type = 'double';
          }
        }
        if (!Autofarm.isCaptain) {
          Autofarm.claimLoad(
            Autofarm.shouldFarm[Autofarm.town.currentFarmCount].id,
            type,
            function () {
              if (!Autofarm.checkEnabled()) {
                return false;
              }
              Autofarm.shouldFarm[Autofarm.town.currentFarmCount].loot =
                Timestamp.now() + Autofarm.getMethodTime(Autofarm.town.id);
              ModuleManager.updateTimer(
                Autofarm.shouldFarm.length,
                Autofarm.town.currentFarmCount
              );
              Autofarm.town.currentFarmCount++;
              Autofarm.claimResources();
            }
          );
        } else {
          var villages = [];
          $.each(Autofarm.shouldFarm, function (_, village) {
            villages.push(village.id);
          });
          Autofarm.claimLoads(villages, type, function () {
            if (!Autofarm.checkEnabled()) {
              return false;
            }
            Autofarm.finished(Autofarm.getMethodTime(Autofarm.town.id));
          });
        }
      }, Autobot.randomize(
        Autofarm.settings.timebetween * 1e3,
        Autofarm.settings.timebetween * 1e3 + 1e3
      ));
    } else {
      var syndia = null;
      $.each(Autofarm.town.farmTowns, function (lamae, tresaun) {
        var knolyn = tresaun.loot - Timestamp.now();
        if (syndia == null) {
          syndia = knolyn;
        } else {
          if (knolyn <= syndia) {
            syndia = knolyn;
          }
        }
      });
      if (Autofarm.shouldFarm.length > 0) {
        $.each(Autofarm.shouldFarm, function (kenshayla, janye) {
          var meridy = janye.loot - Timestamp.now();
          if (syndia == null) {
            syndia = meridy;
          } else {
            if (meridy <= syndia) {
              syndia = meridy;
            }
          }
        });
      } else {
        ConsoleLog.Log(Autofarm.town.name + ' not ready yet.', 1);
      }
      Autofarm.finished(syndia);
    }
  },
  claimLoad: function (amandah, scarlett, milen) {
    if (!Game.features.battlepoint_villages) {
      DataExchanger.claim_load(
        Autofarm.town.id,
        scarlett,
        Autofarm.getMethodTime(Autofarm.town.id),
        amandah,
        function (yuen) {
          Autofarm.claimLoadCallback(amandah, yuen);
          milen(yuen);
        }
      );
    } else {
      DataExchanger.frontend_bridge(
        Autofarm.town.id,
        {
          model_url:
            'FarmTownPlayerRelation/' +
            MM.getOnlyCollectionByName(
              'FarmTownPlayerRelation'
            ).getRelationForFarmTown(amandah).id,
          action_name: 'claim',
          arguments: { farm_town_id: amandah, type: 'resources', option: 1 },
        },
        function (waukesha) {
          Autofarm.claimLoadCallback(amandah, waukesha);
          milen(waukesha);
        }
      );
    }
  },
  claimLoadCallback: function (berklee, kelbi) {
    if (kelbi.success) {
      var jacin = kelbi.satisfaction,
        shateia = kelbi.lootable_human;
      if (kelbi.relation_status === 2) {
        WMap.updateStatusInChunkTowns(
          berklee.id,
          jacin,
          Timestamp.now() + Autofarm.getMethodTime(Autofarm.town.id),
          Timestamp.now(),
          shateia,
          2
        );
        WMap.pollForMapChunksUpdate();
      } else {
        WMap.updateStatusInChunkTowns(
          berklee.id,
          jacin,
          Timestamp.now() + Autofarm.getMethodTime(Autofarm.town.id),
          Timestamp.now(),
          shateia
        );
      }
      Layout.hideAjaxLoader();
      ConsoleLog.Log(
        '<span style="color: #6FAE30;">' + kelbi.success + '</span>',
        1
      );
    } else {
      if (kelbi.error) {
        ConsoleLog.Log(Autofarm.town.name + ' ' + kelbi.error, 1);
      }
    }
  },
  claimLoads: function (villages, type, onDone) {
    DataExchanger.claim_loads(
      Autofarm.town.id,
      villages,
      type,
      Autofarm.getMethodTime(Autofarm.town.id),
      function (evangeline) {
        Autofarm.claimLoadsCallback(evangeline);
        onDone(evangeline);
      }
    );
  },
  getMethodTime: function (carlyann) {
    if (Game.features.battlepoint_villages) {
      var nyjee = Autofarm.settings.method;
      $.each(
        MM.getOnlyCollectionByName('Town').getTowns(),
        function (laqueen, jewelya) {
          if (jewelya.id == carlyann) {
            if (jewelya.getResearches().hasResearch('booty')) {
              nyjee = Autofarm.settings.method * 2;
              return false;
            }
          }
        }
      );
      return nyjee;
    } else {
      return Autofarm.settings.method;
    }
  },
  claimLoadsCallback: function (response) {
    if (response.success) {
      var archana = response.notifications,
        handledFarms = response.handled_farms;
      $.each(handledFarms, function (index, village) {
        if (village.relation_status == 2) {
          WMap.updateStatusInChunkTowns(
            index,
            village.satisfaction,
            Timestamp.now() + Autofarm.getMethodTime(Autofarm.town.id),
            Timestamp.now(),
            village.lootable_at,
            2
          );
          WMap.pollForMapChunksUpdate();
        } else {
          WMap.updateStatusInChunkTowns(
            index,
            village.satisfaction,
            Timestamp.now() + Autofarm.getMethodTime(Autofarm.town.id),
            Timestamp.now(),
            village.lootable_at
          );
        }
      });
      ConsoleLog.Log(
        '<span style="color: #6FAE30;">' + response.success + '</span>',
        1
      );
    } else {
      if (response.error) {
        ConsoleLog.Log(Autofarm.town.name + ' ' + response.error, 1);
      }
    }
  },
  finished: function (inbal) {
    if (!Autofarm.checkEnabled()) {
      return false;
    }
    $.each(ModuleManager.playerTowns, function (index, burton) {
      var kyonia = Autofarm.town.relatedTowns.indexOf(burton.id);
      if (kyonia != -1) {
        burton.modules.Autofarm.isReadyTime = Timestamp.now() + inbal;
      }
    });
    Autofarm.town.modules.Autofarm.isReadyTime = Timestamp.now() + inbal;
    ModuleManager.Queue.next();
  },
  stop: function () {
    clearInterval(Autofarm.interval);
  },
  init: function () {
    ConsoleLog.Log('Initialize AutoFarm', 1);
    Autofarm.initButton();
    Autofarm.checkCaptain();
    Autofarm.loadSettings();
  },
  initButton: function () {
    ModuleManager.initButtons('Autofarm');
  },
  checkCaptain: function () {
    if ($('.advisor_frame.captain div').hasClass('captain_active')) {
      Autofarm.isCaptain = true;
    }
  },
  loadSettings: function () {
    let _settings = localStorage.getItem('Autofarm.Settings');
    if (_settings) {
      $.extend(Autofarm.settings, JSON.parse(_settings));
    }
  },
  contentSettings: function () {
    return $('<fieldset/>', {
      id: 'Autofarm_settings',
      style: 'float:left; width:472px;height: 270px;',
    })
      .append($('<legend/>').html(Autofarm.title))
      .append(
        FormBuilder.checkbox({
          text: 'AutoStart AutoFarm.',
          id: 'autofarm_autostart',
          name: 'autofarm_autostart',
          checked: Autofarm.settings.autostart,
          disabled: !Autofarm.hasP,
        })
      )
      .append(function () {
        var config = {
          id: 'autofarm_method',
          name: 'autofarm_method',
          label: 'Farm method: ',
          styles: 'width: 120px;',
          value: Autofarm.settings.method,
          options: [
            { value: '300', name: '5 minute farm' },
            { value: '613', name: '10 minute farm' },
            { value: '1200', name: '20 minute farm' },
            { value: '5400', name: '90 minute farm' },
            { value: '14400', name: '240 minute farm' },
          ],
          disabled: false,
        };
        if (!Autofarm.hasP) {
          config = $.extend(config, { disabled: true });
        }
        var larenz = FormBuilder.selectBox(config);
        if (!Autofarm.hasP) {
          larenz.mousePopup(new MousePopup('Premium required'));
        }
        return larenz;
      })
      .append(function () {
        var kicia = {
          id: 'autofarm_bewteen',
          name: 'autofarm_bewteen',
          label: 'Time before next farm: ',
          styles: 'width: 120px;',
          value: Autofarm.settings.timebetween,
          options: [
            { value: '1', name: '1-2 seconds' },
            { value: '3', name: '3-4 seconds' },
            { value: '5', name: '5-6 seconds' },
            { value: '7', name: '7-8 seconds' },
            { value: '9', name: '9-10 seconds' },
          ],
        };
        if (!Autofarm.hasP) {
          kicia = $.extend(kicia, { disabled: true });
        }
        var halana = FormBuilder.selectBox(kicia);
        if (!Autofarm.hasP) {
          halana.mousePopup(new MousePopup('Premium required'));
        }
        return halana;
      })
      .append(
        FormBuilder.checkbox({
          text: 'Skip farm when warehouse is full.',
          id: 'autofarm_warehousefull',
          name: 'autofarm_warehousefull',
          checked: Autofarm.settings.skipWhenFull,
          disabled: !Autofarm.hasP,
        })
      )
      .append(
        FormBuilder.checkbox({
          text: 'Lowest resources first with more towns on one island.',
          id: 'autofarm_lowresfirst',
          name: 'autofarm_lowresfirst',
          checked: Autofarm.settings.lowresfirst,
          disabled: !Autofarm.hasP,
        })
      )
      .append(
        FormBuilder.checkbox({
          text: 'Stop loot farm until mood is below 80%.',
          id: 'autofarm_loot',
          name: 'autofarm_loot',
          checked: Autofarm.settings.stoplootbelow,
          disabled: !Autofarm.hasP,
        })
      )
      .append(
        FormBuilder.button({
          name: DM.getl10n('notes').btn_save,
          class: !Autofarm.hasP ? ' disabled' : '',
          style: 'top: 62px;',
        }).on('click', function () {
          if (!Autofarm.hasP) {
            return false;
          }
          var settings = $('#Autofarm_settings').serializeObject();
          Autofarm.settings.autostart =
            settings.autofarm_autostart != undefined;
          Autofarm.settings.method = parseInt(settings.autofarm_method);
          Autofarm.settings.timebetween = parseInt(settings.autofarm_bewteen);
          Autofarm.settings.skipWhenFull =
            settings.autofarm_warehousefull != undefined;
          Autofarm.settings.lowresfirst =
            settings.autofarm_lowresfirst != undefined;
          Autofarm.settings.stoplootbelow = settings.autofarm_loot != undefined;
          localStorage.setItem(
            'Autofarm.Settings',
            JSON.stringify(Autofarm.settings)
          );
          ConsoleLog.Log('Settings settings', 1);
          HumanMessage.success('The settings were settings!');
        })
      );
  },
};
