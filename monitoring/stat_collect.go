package monitoring

import (
	"context"
	"sync"
	"time"

	"github.com/lindb/lindb/models"
	"github.com/lindb/lindb/pkg/fileutil"
)

type ReportFunc func(stat interface{})

// StatCollect represents the monitoring stat collect
type StatCollect struct {
	interval time.Duration
	storage  string
	reporter Reporter
	timer    *time.Timer

	systemStat *models.SystemStat
	nodeStat   *models.NodeStat

	ctx context.Context

	mux sync.RWMutex
}

// NewStatCollect creates a stat collector
func NewStatCollect(ctx context.Context, interval time.Duration,
	storage string, reporter Reporter, node models.ActiveNode,
) *StatCollect {
	r := &StatCollect{
		interval:   interval,
		storage:    fileutil.GetExistPath(storage),
		reporter:   reporter,
		timer:      time.NewTimer(interval),
		systemStat: &models.SystemStat{},
		nodeStat: &models.NodeStat{
			Node: node,
		},
		ctx: ctx,
	}
	go r.start()
	return r
}

// start starts a background goroutine that collects the monitoring stat
func (r *StatCollect) start() {
	defer r.timer.Stop()
	// collect system status
	r.collect()
	// report system status
	r.report()

	for {
		select {
		case <-r.timer.C:
			// collect system status
			r.collect()
			// report system status
			r.report()
			// reset time interval
			r.timer.Reset(r.interval)
		case <-r.ctx.Done():
			return
		}
	}
}

// collect collects the monitoring stat
func (r *StatCollect) collect() {
	r.mux.Lock()
	defer r.mux.Unlock()

	r.systemStat.CPUs = GetCPUs()
	r.systemStat.MemoryStat = GetMemoryStat()
	r.systemStat.CPUStat = GetCPUStat()
	r.systemStat.DiskStat = GetDiskStat(r.storage)
}

// report reports stat by report function
func (r *StatCollect) report() {
	r.mux.RLock()
	defer r.mux.RUnlock()

	r.nodeStat.System = *r.systemStat
	r.reporter.Report(r.nodeStat)
}