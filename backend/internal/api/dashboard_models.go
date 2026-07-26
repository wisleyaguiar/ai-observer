package api

import "time"

// Dashboard represents a user-defined dashboard
type Dashboard struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	IsDefault   bool      `json:"isDefault"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// DashboardWidget represents a widget placed on a dashboard
type DashboardWidget struct {
	ID          string       `json:"id"`
	DashboardID string       `json:"dashboardId"`
	WidgetType  string       `json:"widgetType"`
	Title       string       `json:"title"`
	GridColumn  int          `json:"gridColumn"`
	GridRow     int          `json:"gridRow"`
	ColSpan     int          `json:"colSpan"`
	RowSpan     int          `json:"rowSpan"`
	Config      WidgetConfig `json:"config,omitempty"`
	CreatedAt   time.Time    `json:"createdAt"`
	UpdatedAt   time.Time    `json:"updatedAt"`
}

// WidgetConfig holds optional configuration for configurable widgets
type WidgetConfig struct {
	Service            string `json:"service,omitempty"`
	MetricName         string `json:"metricName,omitempty"`
	BreakdownAttribute string `json:"breakdownAttribute,omitempty"`
	BreakdownValue     string `json:"breakdownValue,omitempty"`
	ChartStacked       *bool  `json:"chartStacked,omitempty"`
	LogSearch          string `json:"logSearch,omitempty"`
}

// DashboardWithWidgets represents a full dashboard with its widgets
type DashboardWithWidgets struct {
	Dashboard
	Widgets []DashboardWidget `json:"widgets"`
}

// Request/Response types

type CreateDashboardRequest struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	IsDefault   bool   `json:"isDefault,omitempty"`
}

type UpdateDashboardRequest struct {
	Name        string `json:"name,omitempty"`
	Description string `json:"description,omitempty"`
}

type CreateWidgetRequest struct {
	WidgetType string       `json:"widgetType"`
	Title      string       `json:"title"`
	GridColumn int          `json:"gridColumn"`
	GridRow    int          `json:"gridRow"`
	ColSpan    int          `json:"colSpan"`
	RowSpan    int          `json:"rowSpan"`
	Config     WidgetConfig `json:"config,omitempty"`
}

type UpdateWidgetRequest struct {
	Title      string       `json:"title,omitempty"`
	GridColumn int          `json:"gridColumn,omitempty"`
	GridRow    int          `json:"gridRow,omitempty"`
	ColSpan    int          `json:"colSpan,omitempty"`
	RowSpan    int          `json:"rowSpan,omitempty"`
	Config     WidgetConfig `json:"config,omitempty"`
}

type WidgetPosition struct {
	ID         string `json:"id"`
	GridColumn int    `json:"gridColumn"`
	GridRow    int    `json:"gridRow"`
}

type UpdateWidgetPositionsRequest struct {
	Positions []WidgetPosition `json:"positions"`
}

type DashboardsResponse struct {
	Dashboards []Dashboard `json:"dashboards"`
}
